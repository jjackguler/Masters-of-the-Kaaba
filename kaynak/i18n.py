import re,sys,json
REGEX_PREV=set('(,=:[!&|?{};+-*%<>~^')
def wrap(src, found):
    out=[];i=0;n=len(src)
    def prev_sig(k):
        j=k-1
        while j>=0 and src[j] in ' \t\n': j-=1
        return j
    while i<n:
        c=src[i]
        if c=='/' and i+1<n and src[i+1]=='/':
            j=src.find('\n',i); j=n if j<0 else j; out.append(src[i:j]); i=j; continue
        if c=='/' and i+1<n and src[i+1]=='*':
            j=src.find('*/',i+2)+2; out.append(src[i:j]); i=j; continue
        if c=='/':
            j=prev_sig(i); pc=src[j] if j>=0 else '('
            word=re.search(r'(\w+)$',src[:j+1]); kw=word.group(1) if word else ''
            if pc in REGEX_PREV or kw in ('return','typeof','case'):
                k=i+1;cls=False
                while k<n:
                    ch=src[k]
                    if ch=='\\': k+=2; continue
                    if ch=='[': cls=True
                    elif ch==']': cls=False
                    elif ch=='/' and not cls: break
                    k+=1
                k+=1
                while k<n and src[k].isalpha(): k+=1
                out.append(src[i:k]); i=k; continue
        if c=='`':
            k=i+1
            while k<n and src[k]!='`':
                if src[k]=='\\': k+=1
                k+=1
            out.append(src[i:k+1]); i=k+1; continue
        if c in '\'"':
            k=i+1
            while k<n and src[k]!=c:
                if src[k]=='\\': k+=1
                k+=1
            lit=src[i:k+1]; body=lit[1:-1]
            j=prev_sig(i); pc=src[j] if j>=0 else ''
            m=k+1
            while m<n and src[m] in ' \t': m+=1
            nc=src[m] if m<n else ''
            pre=src[max(0,j-4):j+1]
            human=bool(re.search(r'[^\x00-\x7f]',body)) or ' ' in body or bool(re.match(r'^[A-ZÇĞİÖŞÜ][a-zçğıöşüâîû]',body))
            skip=(pc in '{,' and nc==':') or pre.endswith('case') or re.match(r'^[#\[]|^\.[a-z]',body) or nc=='(' or not body.strip() or pc=='.'
            if human and not skip:
                val=json.loads('"'+body.replace('\\\'','\'').replace('"','\\"')+'"') if c=="'" else json.loads(lit)
                found.add(val); out.append('__t('+lit+')')
            else: out.append(lit)
            i=k+1; continue
        out.append(c); i+=1
    return ''.join(out)
found=set()
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read(); open(f.replace('.js','.t.js'),'w',encoding='utf-8',newline='\n').write(wrap(s,found))
json.dump(sorted(found),open('strings.json','w',encoding='utf-8',newline='\n'),ensure_ascii=False,indent=0)
print(len(found))
