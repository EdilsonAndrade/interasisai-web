# Quickstart: Guia de onboarding para cadastro de tenant

Roteiro de verificação manual, a rodar localmente (`npm run dev`) após a implementação, em complemento aos testes automatizados.

## Pré-requisitos

- Sessão de admin autenticada (`/admin/tenants` acessível).
- Navegador com localStorage habilitado (aba normal, não anônima, para testar persistência entre reloads).

## Roteiro

1. **Primeira exibição do guia**
   - Limpar localStorage do domínio (DevTools → Application → Local Storage → limpar).
   - Ir em `/admin/tenants`, clicar em criar tenant.
   - Verificar: aviso informativo pergunta sobre prompt inicial e base de conhecimento; clicar/dispensar não bloqueia o submit.
   - Completar o cadastro do tenant. Verificar: painel lateral abre automaticamente com os 8 itens na ordem correta, todos com destaque piscando, e a opção de desativar o guia visível.

2. **Progresso persistente entre telas**
   - Marcar 2–3 itens no painel (ex.: prompt operacional, prompt institucional).
   - Verificar: destaque piscando some desses itens.
   - Navegar para `/admin/prompt-manager` (aba de Guardrails).
   - Verificar: painel continua visível, com os mesmos itens marcados.

3. **Fechar aba e retomar**
   - Recarregar a página (F5) no meio do checklist.
   - Verificar: progresso marcado é retomado exatamente como estava.

4. **Desativar o guia**
   - Em um novo tenant (ou limpando o progresso do atual), clicar em "desativar o guia".
   - Verificar: painel fecha.
   - Criar outro tenant novo.
   - Verificar: painel não abre automaticamente.

5. **Reativar o guia**
   - Com o guia desativado, localizar o controle de reativação (ex.: na tela de tenants).
   - Reativar e criar um novo tenant.
   - Verificar: painel volta a abrir normalmente.

6. **Guia por navegador, não por dispositivo**
   - Repetir o passo 4 (desativar) em um navegador.
   - Abrir a aplicação em outro navegador (ou aba anônima).
   - Verificar: guia aparece normalmente (preferência não sincronizou).

7. **Acessibilidade básica**
   - Navegar pelo painel apenas via teclado (Tab/Enter/Espaço).
   - Verificar: cada item do checklist é alcançável e marcável sem mouse; leitor de tela (ou inspeção da árvore de acessibilidade) expõe o estado marcado/pendente de cada item.

## Critério de aceite do roteiro

Todos os 7 passos acima devem se comportar exatamente como descrito, sem erros no console do navegador em nenhum momento.
