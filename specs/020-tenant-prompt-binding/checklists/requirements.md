# Specification Quality Checklist: Vínculo obrigatório de prompt no tenant e associação em massa

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-22
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

### Iteração 1 — problemas encontrados e corrigidos

1. **Vazamento de implementação**: a versão inicial nomeava rotas de API (`GET /prompt-manager/prompts?node_type=operational`), nomes de arquivo (`TenantForm.tsx`), campos de payload (`is_default_prompt`, `prompt_id`) e nomes de função (`isPromptBindingMissing`). Reescrito em linguagem de domínio: "lista de prompts do nó operacional", "formulário de criação de tenant", "sinal de detecção", "ponto único de detecção".
2. **FR-014 sem critério verificável**: "isolar num helper" é instrução de código, não requisito. Reformulado como propriedade observável — a troca do sinal não deve exigir alterações espalhadas.
3. **SC baseados em latência técnica**: substituídos por métricas de tarefa do administrador (número de interações, tempo de identificação do problema, operações economizadas).
4. **Ambiguidade no órfão**: explicitado no FR-010 que não há tentativa de desfazer e que o administrador é informado da disponibilidade do prompt.

### Decisões registradas (não são lacunas)

Quatro pontos foram fechados com o autor do ticket antes da spec e estão refletidos como decisão, não como pergunta em aberto:

- **Sem pré-seleção no combo** (FR-004/FR-005) — pré-selecionar o padrão reintroduziria por UX a herança implícita que o EDI-43 eliminou.
- **Prompt órfão aceito** (FR-010) — sem compensação no cliente; ele é reaproveitável e excluível sem atrito.
- **Detecção pelo sinal existente**, não por campo de status novo (FR-013/FR-014) — o campo estruturado não existe e não há ticket para ele; a detecção fica isolada para troca futura barata.
- **Escopo restrito ao nó operacional** (FR-019) — o sinal disponível tem ponto cego conhecido no institucional.

### Riscos conhecidos para a fase de planejamento

- O contrato do backend foi acordado no ticket mas ainda não foi validado contra o serviço rodando. A validação local precisa acontecer antes de fechar a implementação.
- A supressão do conteúdo do prompt no estado de erro (FR-015) é sutil e fácil de regredir: merece teste explícito.
- A preservação do marcador de proteções no conteúdo copiado (FR-008) é o item de maior impacto silencioso da feature — se falhar, o prompt nasce com as proteções congeladas e ninguém percebe.
