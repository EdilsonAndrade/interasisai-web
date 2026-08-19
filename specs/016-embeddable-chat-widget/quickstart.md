# Quickstart: Widget de Chat Embutível para Clientes

Passos para validar a feature de ponta a ponta em ambiente local, após a implementação (Phase 3+).

## 1. Build do bundle do widget

```bash
npm run build:widget
```

Gera `public/widget/widget.bundle.js`, consumido pelo Route Handler em tempo de execução.

## 2. Subir o site (admin + Route Handler)

```bash
npm run dev
```

## 3. Cadastrar um tenant de teste

1. Acessar `/admin/tenants`, autenticar como administrador.
2. Cadastrar um tenant com `id` de teste (ex.: `demo-cliente`) e `allowed_domains: ["localhost:5500"]`.

## 4. Obter e copiar o snippet

1. Consultar o tenant recém-criado em `/admin/tenants`.
2. Usar a nova ação "Ver snippet de instalação" (`TenantSnippet.tsx`) e copiar o trecho exibido.

## 5. Instalar em uma página de teste externa

Criar um arquivo HTML fora deste projeto (simulando o site do cliente) servido em `http://localhost:5500` (ex.: via `npx serve` ou extensão Live Server), colando o snippet copiado sem editar nada:

```html
<!doctype html>
<html>
  <body>
    <h1>Site de teste do cliente</h1>
    <!-- snippet colado aqui, sem edição -->
    <script src="http://localhost:3000/widget/demo-cliente" async></script>
  </body>
</html>
```

**Esperado**: a bolha de chat aparece no canto inferior direito; ao abrir e enviar uma mensagem, a resposta vem da IA usando a base de conhecimento do tenant `demo-cliente`.

## 6. Validar bloqueio de domínio não autorizado

Servir a mesma página de teste em uma porta/origem **não** listada em `allowed_domains` (ex.: `http://localhost:5501`).

**Esperado**: nenhuma bolha de chat aparece; nenhum erro visível é exibido na página — apenas o `initializeChatSession` falhando silenciosamente (verificável no painel de rede do DevTools, não na UI).

## 7. Validar múltiplas páginas do mesmo site

Colar o mesmo snippet em duas páginas HTML diferentes servidas pela mesma origem autorizada e confirmar que o widget funciona identicamente em ambas.

## 8. Validar desativação de tenant

Excluir o tenant `demo-cliente` pelo admin e recarregar a página de teste — o widget deve deixar de aparecer.
