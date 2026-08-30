# Quickstart: Validar InterasisAI Connect — Card Rebrand & Página de Valor

Passos manuais para validar a feature localmente após a implementação (sem substituir os testes automatizados de Jest/RTL exigidos pela constituição).

1. `npm run dev` e abrir a landing page (`/`).
2. Rolar até a seção de Cases de Sucesso e localizar o card antes chamado "Assistente IA Omnichannel (RAG)".
3. Confirmar:
   - Título exibido é **InterasisAI Connect**.
   - Existe um texto de impacto de negócio, visualmente distinto da descrição técnica existente.
   - Existem dois botões lado a lado no rodapé do card: "Testar Assistente ao Vivo" e "Saiba mais".
4. Clicar em "Saiba mais":
   - O navegador navega para uma nova URL (`/{locale}/interasisai-connect`) — não é uma sobreposição na mesma página.
   - A página carrega com cabeçalho e rodapé do site (layout compartilhado).
   - Conteúdo exibido cobre: comparação de conversas, explicação da arquitetura, tabela comparativa e passos do processo.
5. Copiar a URL da página, abrir em uma aba anônima/nova (sem visitar a home antes) e confirmar que carrega normalmente com o mesmo conteúdo.
6. Inspecionar o `<head>` da página (ferramentas de desenvolvedor → Elements, ou "Ver código-fonte") e confirmar que `<title>`, `<meta name="description">` e as tags `og:title`/`og:description`/`og:image` são específicas do InterasisAI Connect — não as mesmas da home.
7. Na página, clicar em cada uma das 5 abas de vertical (Buffet e eventos, Clínica, Escola, Imobiliária, RH) e confirmar que a simulação de conversa e os vereditos mudam a cada clique, sem navegar para outra URL.
8. Clicar em "Testar Assistente ao Vivo" dentro da página de valor e confirmar que o mesmo widget de chat da landing page abre normalmente.
9. Repetir os passos 2–7 trocando o idioma do site para `en` e `es` (seletor de idioma existente), confirmando que a URL usa o prefixo de idioma correspondente (`/en/interasisai-connect`, `/es/interasisai-connect`) e que todo o texto aparece no idioma selecionado, sem mistura de idiomas.
10. Testar em largura mobile (DevTools ~375px): confirmar que o card, os dois botões e a página de valor permanecem legíveis e sem overflow horizontal.
11. Testar navegação só por teclado: `Tab` até "Saiba mais", `Enter` para navegar, `Tab`/`Shift+Tab` entre as abas de vertical na página de destino.
12. Conferir `src/app/sitemap.ts` (ou `/sitemap.xml` em dev) e confirmar que as 3 variações de idioma da nova rota aparecem listadas.
13. Ver o código-fonte da página e localizar os dois blocos `<script type="application/ld+json">`; colar o conteúdo de cada um em um validador público de dados estruturados e confirmar que o `Service` e o `BreadcrumbList` validam sem erros (SC-007).
14. Confirmar que a tag `<meta property="og:image">` aponta para uma imagem existente (`/images/interasisai-connect-cover.png` se já entregue pelo solicitante, ou `/images/interasisai_coverpage.png` como fallback) — nunca vazia.
