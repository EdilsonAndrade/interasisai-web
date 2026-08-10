# Feature Specification: Internacionalização com Seletor de Idiomas

**Feature Branch**: `014-i18n-language-switcher`  
**Created**: 2026-08-10  
**Status**: Draft  
**Input**: User description: "Eu como usuário que acessa a página que é pública, quero poder visualizar o site no idioma do meu país, e ter também a possibilidade de alterar os idiomas entre Português Brasil, Inglês e Espanhol visualizando a bandeira no menu do topo ao lado direito do mesmo. Também quando eu acessar a página com um computador que está em uma rede dos Estados Unidos ou do idioma que trabalhamos mostrar neste idioma, caso não for detectado o idioma mostrar por padrão o Inglês."

## Resumo Funcional

O site público deve detectar automaticamente o idioma do visitante com base na localização geográfica da rede de origem (geo-IP) e exibir o conteúdo no idioma correspondente. O visitante pode alternar manualmente entre Português (Brasil), Inglês e Espanhol por meio de um seletor com bandeiras posicionado no canto superior direito do menu de navegação. O idioma padrão é Inglês para casos em que a detecção automática não for possível.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detecção automática de idioma por localização (Priority: P1)

Como visitante que acessa o site público pela primeira vez, quero que o conteúdo seja exibido automaticamente no idioma do meu país, para que eu possa compreender o site sem precisar configurar nada manualmente.

**Why this priority**: A detecção automática é a primeira impressão do site e elimina fricção para a maioria dos visitantes. Sem isso, o site sempre aparece em um único idioma, potencialmente alienando visitantes internacionais.

**Independent Test**: Pode ser testado acessando o site de uma rede localizada nos Estados Unidos (Inglês), Brasil (Português), ou país hispanofalante (Espanhol), e verificando que o conteúdo é exibido no idioma correspondente. Também pode ser simulado alterando os cabeçalhos de localização.

**Acceptance Scenarios**:

1. **Given** que um visitante acessa o site de uma rede nos Estados Unidos, **When** a página carrega, **Then** todo o conteúdo é exibido em Inglês e o seletor de idiomas mostra a bandeira dos EUA/Reino Unido como ativa.
2. **Given** que um visitante acessa o site de uma rede no Brasil, **When** a página carrega, **Then** todo o conteúdo é exibido em Português (Brasil) e o seletor de idiomas mostra a bandeira do Brasil como ativa.
3. **Given** que um visitante acessa o site de uma rede em país hispanofalante (ex: México, Espanha, Argentina), **When** a página carrega, **Then** todo o conteúdo é exibido em Espanhol e o seletor de idiomas mostra a bandeira da Espanha como ativa.
4. **Given** que um visitante acessa o site de uma rede em país cujo idioma não é suportado (ex: Alemanha, Japão), **When** a página carrega, **Then** o conteúdo é exibido em Inglês (idioma padrão) e o seletor mostra a bandeira do inglês como ativa.
5. **Given** que não é possível determinar a localização do visitante (erro no serviço de geo-IP, rede bloqueada, etc.), **When** a página carrega, **Then** o conteúdo é exibido em Inglês como fallback padrão, sem mensagens de erro visíveis ao usuário.

---

### User Story 2 - Seleção manual de idioma com bandeiras (Priority: P1)

Como visitante do site, quero poder alternar manualmente o idioma entre Português (Brasil), Inglês e Espanhol através de um seletor com bandeiras no canto superior direito do menu, para que eu possa escolher o idioma de minha preferência independentemente da minha localização.

**Why this priority**: O seletor manual é essencial para visitantes que estão em um país mas preferem outro idioma (ex: turista brasileiro nos EUA), ou quando a detecção automática falha. Tem a mesma prioridade que a detecção automática pois ambas entregam o valor central da feature.

**Independent Test**: Pode ser testado clicando no seletor de idiomas no header, escolhendo uma bandeira diferente, e verificando que todo o conteúdo da página é atualizado imediatamente para o idioma selecionado.

**Acceptance Scenarios**:

1. **Given** que o visitante está em qualquer página pública do site, **When** ele visualiza o menu superior, **Then** vê um seletor de idiomas no lado direito do menu com a bandeira do idioma atualmente ativo.
2. **Given** que o visitante clica no seletor de idiomas, **When** o menu de opções é exibido, **Then** aparecem três opções: bandeira do Brasil com "Português", bandeira dos EUA/Reino Unido com "English", e bandeira da Espanha com "Español", com o idioma atual destacado visualmente.
3. **Given** que o visitante seleciona um idioma diferente do atual, **When** confirma a seleção, **Then** a página é recarregada ou atualizada imediatamente no novo idioma, o seletor fecha, e a bandeira do novo idioma é exibida como ativa.
4. **Given** que o visitante alterna o idioma, **When** navega para outras páginas do site, **Then** o idioma escolhido é mantido em todas as páginas durante a sessão.
5. **Given** que o visitante está em um dispositivo móvel, **When** acessa o menu mobile, **Then** o seletor de idiomas com bandeiras também está disponível no menu colapsado.
6. **Given** que o visitante seleciona um idioma, **When** retorna ao site em uma visita futura no mesmo navegador, **Then** o site preserva sua preferência de idioma (via cookie ou localStorage) e exibe o conteúdo no idioma escolhido anteriormente, respeitando a preferência sobre a detecção automática.

---

### User Story 3 - Conteúdo traduzido completo para os três idiomas (Priority: P2)

Como visitante do site, quero que todo o conteúdo público (textos da landing page, menu de navegação, footer, páginas institucionais, e interface do chatbot) esteja traduzido nos três idiomas suportados, para ter uma experiência completa independente do idioma escolhido.

**Why this priority**: A tradução do conteúdo é o que entrega valor real ao usuário após a infraestrutura de detecção e seleção estar funcionando. Sem conteúdo traduzido, o seletor de idiomas não teria efeito prático.

**Independent Test**: Pode ser testado alternando entre os três idiomas e verificando que todas as seções públicas do site (hero, serviços, portfólio, contato, footer, páginas Sobre/Privacidade/Termos) exibem conteúdo no idioma selecionado, sem textos misturados ou faltantes.

**Acceptance Scenarios**:

1. **Given** que o visitante seleciona qualquer um dos três idiomas, **When** visualiza a landing page, **Then** todos os textos estáticos (títulos, descrições, labels de navegação, CTAs) aparecem no idioma selecionado.
2. **Given** que o visitante seleciona qualquer um dos três idiomas, **When** acessa as páginas institucionais (Sobre, Privacidade, Termos), **Then** o conteúdo completo dessas páginas é exibido no idioma selecionado.
3. **Given** que o visitante seleciona qualquer um dos três idiomas, **When** interage com o chatbot, **Then** os textos da interface do chat (placeholder, botões, mensagens de erro/status) aparecem no idioma selecionado.

---

### Edge Cases

- O que acontece quando o serviço de geo-IP está indisponível ou retorna timeout? O sistema deve aplicar fallback silencioso para Inglês sem impactar o tempo de carregamento da página.
- Como o sistema lida com visitantes que usam VPN mascarando sua localização real? O idioma detectado será baseado na localização do servidor VPN; o usuário pode corrigir manualmente pelo seletor.
- O que acontece quando um visitante tem cookie de preferência de idioma, mas acessa de uma rede em país diferente? A preferência salva (cookie/localStorage) deve prevalecer sobre a detecção automática.
- Como o sistema se comporta com idiomas RTL (right-to-left)? Não se aplica — os três idiomas suportados são LTR.
- O que acontece com URLs já indexadas por mecanismos de busca quando o idioma muda? As URLs devem refletir o locale (ex: `/en/`, `/pt/`, `/es/`) para SEO adequado, e deve haver redirecionamento adequado para URLs sem prefixo de locale.
- O que acontece com o atributo `lang` do elemento `<html>`? Deve ser atualizado dinamicamente para refletir o idioma ativo (`pt-BR`, `en`, `es`), importante para acessibilidade e SEO.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE detectar automaticamente o idioma do visitante com base na localização geográfica da rede de origem (via geo-IP), mapeando a localização para um dos três idiomas suportados: Português (Brasil), Inglês, ou Espanhol.
- **FR-002**: O sistema DEVE utilizar Inglês como idioma padrão (fallback) quando a localização não puder ser determinada ou o país detectado não corresponder a nenhum dos idiomas suportados.
- **FR-003**: O sistema DEVE exibir um seletor de idiomas no canto superior direito do menu de navegação, visível em todas as páginas públicas, contendo as bandeiras representativas de cada idioma (Brasil para pt-BR, EUA ou Reino Unido para en, Espanha para es).
- **FR-004**: O seletor de idiomas DEVE destacar visualmente o idioma atualmente ativo e permitir a troca para qualquer um dos três idiomas suportados com um clique.
- **FR-005**: O sistema DEVE preservar a preferência de idioma escolhida pelo visitante (via cookie ou localStorage) para visitas futuras no mesmo navegador, e essa preferência DEVE prevalecer sobre a detecção automática.
- **FR-006**: O sistema DEVE estruturar as URLs públicas com prefixo de locale (`/pt/`, `/en/`, `/es/`) para cada idioma, com redirecionamento automático de URLs sem prefixo para o locale detectado ou padrão.
- **FR-007**: O sistema DEVE atualizar o atributo `lang` do elemento `<html>` dinamicamente conforme o idioma ativo (`pt-BR`, `en`, `es`).
- **FR-008**: O sistema DEVE disponibilizar todos os textos estáticos da interface pública (menu de navegação, landing page, footer, CTAs, labels) nos três idiomas suportados.
- **FR-009**: O sistema DEVE disponibilizar o conteúdo das páginas institucionais (Sobre, Termos de Uso, Política de Privacidade) nos três idiomas suportados.
- **FR-010**: O sistema DEVE disponibilizar os textos da interface do chatbot (placeholder do input, botões, mensagens de status/erro) nos três idiomas suportados.
- **FR-011**: O seletor de idiomas DEVE estar disponível também no menu mobile (hamburguer), mantendo a mesma funcionalidade e aparência de bandeiras.
- **FR-012**: O sistema DEVE lidar graciosamente com falhas no serviço de geo-IP, aplicando fallback para Inglês sem exibir erros ao visitante e sem aumentar perceptivelmente o tempo de carregamento da página.

### Key Entities

- **Locale**: Representa um idioma suportado pelo sistema. Atributos: código do locale (`pt-BR`, `en`, `es`), bandeira associada, nome de exibição nativo ("Português", "English", "Español").
- **Preferência de Idioma**: Registro da escolha de idioma do visitante. Atributos: locale selecionado, timestamp da última alteração. Persistido via cookie ou localStorage no navegador do visitante.
- **Dicionário de Tradução**: Conjunto de chaves textuais e seus valores correspondentes em cada idioma suportado. Organizado por namespace/seção (ex: `common`, `home`, `about`, `chat`, `footer`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitantes de redes nos Estados Unidos visualizam o site em Inglês automaticamente em 100% dos acessos onde o serviço de geo-IP está funcional.
- **SC-002**: Visitantes de redes no Brasil visualizam o site em Português (Brasil) automaticamente em 100% dos acessos onde o serviço de geo-IP está funcional.
- **SC-003**: A troca de idioma via seletor de bandeiras é concluída em menos de 2 segundos após o clique, com feedback visual imediato.
- **SC-004**: 100% dos textos estáticos da interface pública possuem tradução completa nos três idiomas, sem fallback para outro idioma ou chaves de tradução expostas.
- **SC-005**: O idioma escolhido manualmente pelo visitante persiste entre sessões de navegação (fechar e reabrir o navegador) com 100% de confiabilidade.
- **SC-006**: O seletor de idiomas está visível e funcional em 100% das páginas públicas, incluindo visualização mobile, sem quebras de layout.
- **SC-007**: A detecção automática de idioma não adiciona mais de 500ms ao tempo de carregamento inicial da página.

## Assumptions

- O serviço de geo-IP será provido por uma API externa (ex: Cloudflare Workers com cabeçalho `CF-IPCountry`, Vercel Edge com `x-vercel-ip-country`, ou serviço similar) — a escolha específica será definida na fase de planejamento com base na infraestrutura de deploy.
- O Next.js App Router com middleware será utilizado para roteamento baseado em locale, seguindo o padrão recomendado pela documentação do Next.js para internacionalização.
- As traduções serão gerenciadas por arquivos de dicionário estáticos (JSON ou similar) carregados no servidor, sem necessidade de API externa de tradução.
- As bandeiras serão representadas por emojis de bandeira nativos (🇧🇷, 🇺🇸/🇬🇧, 🇪🇸) para simplicidade, sem dependência de bibliotecas de ícones de bandeira.
- O conteúdo institucional (Sobre, Termos, Privacidade) já existe em Português como fonte primária e será traduzido para Inglês e Espanhol como parte desta feature.
- A interface do chatbot será tratada como parte do escopo de tradução, mas apenas os textos estáticos da UI do chat — as mensagens trocadas com o backend do chatbot permanecem no idioma em que forem enviadas/recebidas.
- O SEO será tratado com URLs localizadas (`/pt/`, `/en/`, `/es/`) e tags `hreflang` apropriadas no `<head>`.
- O projeto utiliza Next.js 15+ com App Router, que possui suporte nativo a i18n via middleware e `next-intl` como biblioteca recomendada pela comunidade.
