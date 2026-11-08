# Bakes tileable albedo + normal textures for Bekke (numpy, deterministic).
import numpy as np, base64, io, json
from PIL import Image, ImageFilter
rng=np.random.default_rng(605)
def noise(n,cells,seed):
    r=np.random.default_rng(seed);g=r.random((cells,cells)).astype(np.float32)
    im=Image.fromarray((g*255).astype(np.uint8)).resize((n,n),Image.BICUBIC)
    # make tileable by wrapping: resize a 3x tiled grid and crop the centre
    big=np.tile(g,(3,3));im=Image.fromarray((big*255).astype(np.uint8)).resize((n*3,n*3),Image.BICUBIC)
    a=np.asarray(im,dtype=np.float32)[n:2*n,n:2*n]/255.;return a
def fbm(n,base,oct,seed,gain=.5):
    s=np.zeros((n,n),np.float32);amp=1;tot=0
    for o in range(oct):
        c=base*2**o
        if c>n: break
        s+=amp*noise(n,c,seed+o*17);tot+=amp;amp*=gain
    return s/tot
def aniso(n,cx,cy,seed):
    r=np.random.default_rng(seed);g=r.random((cy,cx)).astype(np.float32);big=np.tile(g,(3,3))
    im=Image.fromarray((big*255).astype(np.uint8)).resize((n*3,n*3),Image.BICUBIC);return np.asarray(im,np.float32)[n:2*n,n:2*n]/255.
def normal(h,strength):
    dx=(np.roll(h,-1,1)-np.roll(h,1,1))*strength;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*strength
    nz=np.ones_like(h);l=np.sqrt(dx*dx+dy*dy+1)
    n=np.stack([-dx/l,dy/l,nz/l],-1);return ((n*.5+.5)*255).clip(0,255).astype(np.uint8)
def save(name,arr,q=86):
    im=Image.fromarray(arr.clip(0,255).astype(np.uint8));im.save(f'tex/{name}.jpg',quality=q)
def col(h,c0,c1):
    c0=np.array(c0,np.float32);c1=np.array(c1,np.float32);return c0+(c1-c0)*h[...,None]
def cracks(n,count,seed,length=120):
    r=np.random.default_rng(seed);m=np.zeros((n,n),np.float32)
    for _ in range(count):
        x,y=r.random()*n,r.random()*n;a=r.random()*6.28
        for k in range(int(length*(.4+r.random()))):
            a+=r.normal()*.12;x=(x+np.cos(a))%n;y=(y+np.sin(a))%n;m[int(y),int(x)]=1
    return np.asarray(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7)),np.float32)/255.
def voronoi_rows(n,rows,seed,jit=.35,wmin=.6,wmax=1.4):
    """irregular coursed masonry: returns stone id map, edge distance, per-stone tone"""
    r=np.random.default_rng(seed);ids=np.zeros((n,n),np.int32);edge=np.zeros((n,n),np.float32);tone=np.zeros((n,n),np.float32)
    yy,xx=np.mgrid[0:n,0:n];rh=n/rows;sid=0
    for ri in range(rows):
        y0=ri*rh;x=r.random()*rh
        xs=[];
        while x<n+rh: xs.append(x);x+=rh*(wmin+r.random()*(wmax-wmin))
        xs=np.array(xs)
        band=(yy>=y0)&(yy<y0+rh)
        for i in range(len(xs)-1):
            a,b=xs[i],xs[i+1];t=r.random()
            for off in (0,-n,n):
                sel=band&(xx>=a+off)&(xx<b+off)
                if not sel.any(): continue
                dxl=xx[sel]-(a+off);dxr=(b+off)-xx[sel];dyt=yy[sel]-y0;dyb=y0+rh-yy[sel]
                e=np.minimum(np.minimum(dxl,dxr),np.minimum(dyt,dyb))
                edge[sel]=e;tone[sel]=t;ids[sel]=sid
            sid+=1
    return ids,edge,tone
N=512
# 1 plaster (mud render) — neutral warm, tinted per material in the engine
h=fbm(N,8,6,1)*.55+aniso(N,14,110,2)*.25+fbm(N,64,3,3)*.2
cr=cracks(N,10,4,length=55)
straw=(aniso(N,180,22,5)>.86).astype(np.float32)*.5
alb=col(h,(196,170,134),(236,214,180))
alb*=(1-.32*cr[...,None]);alb+= straw[...,None]*np.array([18,14,-6]);alb*=(.94+.12*fbm(N,64,2,6)[...,None])
save('plaster_a',alb);save('plaster_n',normal(h*1.0-cr*.35+straw*.05,3.2))
# 2 rubble-stone masonry (house plinths)
ids,edge,tone=voronoi_rows(N,6,7,wmin=.7,wmax=1.6)
bev=np.clip(edge/9,0,1)**.6
sn=fbm(N,16,4,8)
hs=bev*.8+sn*.25
base=col(tone,(118,104,90),(166,150,128))*(0.75+0.3*sn[...,None])
mortar=np.array([150,128,98],np.float32)
alb=np.where((edge<2.2)[...,None],mortar*(0.9+0.15*sn[...,None]),base)
alb*= (0.82+0.18*bev[...,None])
save('stone_a',alb);save('stone_n',normal(hs,5))
# 3 Kaaba courses: granite blocks / ship-timber courses, 1024x768 = 4 m x 3 m (one stone+wood pair per metre)
W,H=1024,768;rowh=256;sh=184;wh=72
alb=np.zeros((H,W,3),np.float32);hh=np.zeros((H,W),np.float32)
gr=fbm(1024,32,4,9)[:H];spk=np.random.default_rng(10).random((H,W)).astype(np.float32)
grain=aniso(1024,8,320,11)[:H]
r=np.random.default_rng(12)
for k in range(3):
    y0=k*rowh
    # stone course
    x=-r.random()*120
    while x<W:
        bw=110+r.random()*150;t=r.random()
        x0,x1=int(max(0,x)),int(min(W,x+bw))
        yy,xx=np.mgrid[y0:y0+sh,x0:x1]
        e=np.minimum(np.minimum(xx-x,x+bw-xx),np.minimum(yy-y0,y0+sh-yy))
        b=np.clip(e/10,0,1)**.5
        c=np.array([104,103,101],np.float32)+t*30
        tex=c*(0.85+0.25*gr[y0:y0+sh,x0:x1,None])
        tex+= ((spk[y0:y0+sh,x0:x1]>.93)*30-(spk[y0:y0+sh,x0:x1]<.06)*26)[...,None]
        tex*= (0.75+0.25*b[...,None])
        alb[y0:y0+sh,x0:x1]=np.where((e<3)[...,None],np.array([70,64,58]),tex)
        hh[y0:y0+sh,x0:x1]=b*.9+gr[y0:y0+sh,x0:x1]*.2
        x+=bw
    # wood course
    wy0=y0+sh;wy1=y0+rowh
    g=grain[wy0:wy1];alb[wy0:wy1]=np.array([128,86,52],np.float32)*(0.75+0.45*g[...,None]);hh[wy0:wy1]=.55+g*.25
    for j in range(0,W,int(150+r.random()*60)):
        alb[wy0:wy1,j:j+3]=[60,40,26];hh[wy0:wy1,j:j+3]=.4
        for nail in (wy0+18,wy1-18):
            alb[nail-3:nail+3,j+10:j+16]=[40,34,30]
    alb[wy0:wy0+3]=[52,40,30];alb[wy1-3:wy1]=[52,40,30]
save('kaaba_a',alb,88);save('kaaba_n',normal(hh,4))
# 4 sand / ground (10 m tile) — near-neutral, terrain vertex colours give the hue
h=fbm(N,6,6,13)*.5
rip=np.sin((np.mgrid[0:N,0:N][0]*.11+fbm(N,4,3,14)*30))*.5+.5
pebble=np.zeros((N,N),np.float32);rr=np.random.default_rng(15);yy,xx=np.mgrid[0:N,0:N]
for _ in range(260):
    cx,cy,rad=rr.random()*N,rr.random()*N,1+rr.random()*3.5
    dx=(xx-cx+N/2)%N-N/2;dy=(yy-cy+N/2)%N-N/2;d=np.sqrt(dx*dx+dy*dy*1.4)
    pebble=np.maximum(pebble,np.clip(1-d/rad,0,1))
hs=h+rip*.12+pebble*.6
alb=col(h,(214,206,192),(246,240,228))*(1-.28*pebble[...,None])*(0.93+0.1*fbm(N,96,2,16)[...,None])
save('sand_a',alb);save('sand_n',normal(hs,3))
# 5 wood (doors, beams)
M=256;g=aniso(M,6,90,17);knot=fbm(M,4,3,18)
alb=col(g*.7+knot*.3,(92,62,40),(160,116,74))
for x in range(0,M,51):alb[:,x:x+2]*=.55
save('wood_a',alb);save('wood_n',normal(g*.6,3))
# 6 woven wool (awnings, tents): stripes + weave
yy,xx=np.mgrid[0:M,0:M];weave=((np.sin(xx*1.6)*np.sin(yy*1.6))*.5+.5)
stripe=((yy//14)%9);palette=np.array([[222,206,176],[222,206,176],[140,52,40],[222,206,176],[70,56,46],[222,206,176],[222,206,176],[190,140,70],[222,206,176]],np.float32)
alb=palette[stripe]*(0.85+0.2*weave[...,None])*(0.92+0.12*fbm(M,8,3,19)[...,None])
save('wool_a',alb);save('wool_n',normal(weave*.5,2))
# 7 cloud sprite (RGBA png)
C=256;yy,xx=np.mgrid[0:C,0:C];d=np.sqrt(((xx-C/2)/(C/2))**2+((yy-C/2)/(C/2.6))**2)
f=fbm(C,4,5,20);a=np.clip((1-d)*1.6*(0.55+0.7*f)-.15,0,1)
rgba=np.dstack([np.full((C,C),255),np.full((C,C),252),np.full((C,C),248),(a*235)]).astype(np.uint8);Image.fromarray(rgba).save('tex/cloud.png')
# 8 grass tuft (RGBA png)
G=128;img=np.zeros((G,G,4),np.uint8);rr=np.random.default_rng(21)
from PIL import ImageDraw
im=Image.new('RGBA',(G,G),(0,0,0,0));dr=ImageDraw.Draw(im)
for _ in range(26):
    x0=G/2+rr.normal()*12;h_=50+rr.random()*70;lean=rr.normal()*22;c=(int(150+rr.random()*50),int(140+rr.random()*40),int(70+rr.random()*30),255)
    dr.line([(x0,G-1),(x0+lean*.5,G-h_*.6),(x0+lean,G-h_)],fill=c,width=2)
im.save('tex/grass.png')
out={}
for n in ['plaster_a','plaster_n','stone_a','stone_n','kaaba_a','kaaba_n','sand_a','sand_n','wood_a','wood_n','wool_a','wool_n']:
    out[n]='data:image/jpeg;base64,'+base64.b64encode(open(f'tex/{n}.jpg','rb').read()).decode()
for n in ['cloud','grass']:
    out[n]='data:image/png;base64,'+base64.b64encode(open(f'tex/{n}.png','rb').read()).decode()
open('textures.js','w').write('const TEXDATA='+json.dumps(out)+';\n')
print({k:len(v)//1024 for k,v in out.items()})
