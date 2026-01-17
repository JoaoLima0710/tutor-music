# Deploy no Vercel - MusicTutor

## 🚀 Instruções de Deploy

### Opção 1: Via Dashboard do Vercel (Recomendado)

1. **Acesse:** https://vercel.com/new
2. **Importe o repositório GitHub** do MusicTutor
3. **Configure o projeto:**
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm run build:vercel`
   - **Output Directory:** `dist/public`
   - **Install Command:** `pnpm install`
4. **Clique em "Deploy"**

### Opção 2: Via CLI do Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# No diretório do projeto
vercel

# Seguir instruções interativas
```

---

## ⚙️ Configurações Importantes

### Build Command
```
pnpm run build:vercel
```

### Output Directory
```
dist/public
```

### Root Directory
```
./
```

### Install Command
```
pnpm install
```

---

## 🔧 Arquivos de Configuração

### `vercel.json`
Configura:
- Comando de build customizado
- Diretório de output
- Rewrites para SPA (Single Page Application)
- Headers de cache para assets

### `vite.config.vercel.ts`
Build otimizado para Vercel:
- Remove plugins específicos do Manus
- Code splitting otimizado
- Sourcemaps desabilitados (produção)

---

## 🐛 Troubleshooting

### Erro: "Build failed"
**Solução:** Verifique se o `pnpm` está configurado como package manager no Vercel:
- Settings → General → Build & Development Settings
- Package Manager: `pnpm`

### Erro: "Module not found"
**Solução:** Limpe cache do Vercel:
- Settings → General → Clear Cache
- Redeploy

### Erro: 404 em rotas
**Solução:** O `vercel.json` já está configurado com rewrites. Se ainda ocorrer:
- Verifique se o arquivo `vercel.json` está no root do projeto
- Confirme que `"destination": "/index.html"` está presente

### Erro: "vite-plugin-manus-runtime not found"
**Solução:** Use o comando correto:
```bash
pnpm run build:vercel
```
(Não use `pnpm run build` - esse é para Manus)

---

## 📊 Performance

### Otimizações Aplicadas

1. **Code Splitting:**
   - React vendor bundle
   - UI components bundle
   - Audio libraries bundle

2. **Cache Headers:**
   - Assets: 1 ano de cache
   - HTML: sem cache (sempre atualizado)

3. **Sourcemaps:**
   - Desabilitados em produção (menor bundle)

---

## 🌐 Domínio Customizado

Após deploy bem-sucedido:

1. **Acesse:** Settings → Domains
2. **Adicione seu domínio:**
   - Exemplo: `musictutor.com.br`
3. **Configure DNS:**
   - Tipo: `A` ou `CNAME`
   - Valor: fornecido pelo Vercel
4. **Aguarde propagação:** 24-48h

---

## 🔄 Atualizações Automáticas

O Vercel faz deploy automático quando você:
- Faz push para a branch `main` no GitHub
- Cria um pull request (deploy de preview)

**Branches:**
- `main` → Produção (musictutor.vercel.app)
- Outras → Preview (musictutor-git-branch.vercel.app)

---

## 📝 Variáveis de Ambiente

Se precisar adicionar variáveis de ambiente:

1. **Acesse:** Settings → Environment Variables
2. **Adicione:**
   - Nome: `VITE_API_URL`
   - Valor: `https://api.exemplo.com`
3. **Redeploy** para aplicar

**Nota:** Variáveis com prefixo `VITE_` são expostas no frontend.

---

## ✅ Checklist Pós-Deploy

- [ ] Site carrega corretamente
- [ ] Navegação entre páginas funciona
- [ ] Áudio funciona (samples de violão)
- [ ] Microfone funciona (afinador, modo interativo)
- [ ] Responsivo em mobile
- [ ] Performance adequada (Lighthouse > 80)
- [ ] Domínio customizado configurado (opcional)

---

## 🆘 Suporte

**Problemas com Vercel:**
- Documentação: https://vercel.com/docs
- Suporte: https://vercel.com/support

**Problemas com MusicTutor:**
- Abra uma issue no GitHub
- Ou entre em contato com o desenvolvedor
