# Research: Páginas Institucionais do Rodapé

**Date**: 2026-08-07
**Feature**: specs/011-footer-legal-pages

## R1: Estrutura de rotas para páginas institucionais no App Router

### Decision
Criar rotas dedicadas no App Router para `sobre`, `politica-de-privacidade` e `termos`, cada uma com URL estável e indexável.

### Rationale
- Mantém previsibilidade de navegação e facilita acesso direto por URL.
- Preserva semântica e SEO ao separar conteúdos institucionais por rota.
- Alinha com arquitetura já existente em `src/app`.

### Alternatives considered
| Alternativa | Motivo da rejeição |
|---|---|
| Página única com tabs | Dificulta deep link e indexação separada |
| Conteúdo em modal na home | Prejudica acessibilidade e histórico de navegação |
| Links externos para documentos | Quebra consistência de experiência no site |

---

## R2: Reuso do header da home nas páginas institucionais

### Decision
Reutilizar o mesmo padrão de header da home nas páginas institucionais para navegação de retorno aos tópicos principais.

### Rationale
- Garante consistência visual e de navegação.
- Reduz fricção na volta para conteúdo principal.
- Atende diretamente aos requisitos FR-005 e FR-006.

### Alternatives considered
| Alternativa | Motivo da rejeição |
|---|---|
| Header simplificado exclusivo das páginas legais | Perde consistência com a jornada principal |
| Somente botão “Voltar” do navegador | Não é confiável para todos os fluxos de entrada |

---

## R3: Política de visibilidade dos canais sociais no rodapé

### Decision
Exibir apenas LinkedIn nesta versão e ocultar Instagram/YouTube até disponibilidade oficial.

### Rationale
- Evita links incompletos e melhora percepção de qualidade.
- Mantém foco em canais ativos e verificáveis.
- Facilita futura expansão sem retrabalho estrutural.

### Alternatives considered
| Alternativa | Motivo da rejeição |
|---|---|
| Exibir todos com placeholder | Gera frustração do usuário |
| Remover totalmente a seção social | Perde ponto de contato institucional ativo |

---

## R4: Validação do destino do LinkedIn

### Decision
Fixar o destino do link institucional para o URL oficial informado: `https://www.linkedin.com/company/115859702/admin/dashboard/`.

### Rationale
- Evita divergência entre rodapé e canal oficial informado pelo negócio.
- Permite validação objetiva em testes funcionais.

### Alternatives considered
| Alternativa | Motivo da rejeição |
|---|---|
| URL configurável sem validação | Maior risco de inconsistência em conteúdo público |
| Link genérico para LinkedIn home | Não atende objetivo de direcionar ao perfil oficial |

---

## R5: Conteúdo legal como primeira versão evolutiva

### Decision
Publicar v1 de “Sobre”, “Política de Privacidade” e “Termos” com conteúdo institucional inicial e permitir evolução posterior.

### Rationale
- Entrega valor imediato de confiança e transparência.
- Evita bloqueio por refinamentos jurídicos extensos nesta etapa.

### Alternatives considered
| Alternativa | Motivo da rejeição |
|---|---|
| Adiar até versão final jurídica completa | Atraso desnecessário da entrega de navegação institucional |
| Publicar somente uma página genérica | Não atende escopo de três páginas definidas |
