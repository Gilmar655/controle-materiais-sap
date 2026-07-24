# Manual de Utilização

## 1. Acesso ao dashboard

Abra o endereço publicado no GitHub Pages. A base inicial é exibida automaticamente. No cabeçalho, confira:

- fonte dos dados;
- arquivo carregado;
- data da extração;
- última importação realizada neste navegador;
- aba e quantidade de registros;
- data e horário local em tempo real.

Se o arquivo for aberto diretamente pelo computador, a contingência `base-embed.js` mantém os dados iniciais disponíveis mesmo quando o navegador bloqueia a leitura local de arquivos JSON.

## 2. Leitura dos principais indicadores

- **Quantidade orçada:** soma das quantidades planejadas.
- **Quantidade baixada:** soma das quantidades realizadas.
- **Ainda não baixada:** quantidade orçada menos quantidade baixada.
- **Percentual de baixa:** quantidade baixada dividida pela quantidade orçada.
- **Diferença:** quantidade baixada menos quantidade orçada.

Uma diferença negativa indica saldo pendente; zero indica equivalência; positiva indica baixa acima do orçamento.

## 3. Status dos projetos

As faixas padrão são:

- Sem baixa: 0%;
- Baixa crítica: acima de 0% e abaixo de 25%;
- Baixa realização: de 25% até abaixo de 50%;
- Realização parcial: de 50% até abaixo de 80%;
- Próximo da conclusão: de 80% até abaixo de 100%;
- Concluído: exatamente 100%;
- Excesso de baixa: acima de 100%;
- Inconsistente: planejamento inválido ou baixa positiva sem orçamento.

Abra **Configurações** no menu lateral para alterar os limites. As preferências ficam armazenadas no navegador.

## 4. Aplicar filtros

É possível combinar:

- busca textual;
- projeto;
- contrato;
- status;
- material;
- código de movimento;
- reserva;
- centro;
- depósito;
- unidade;
- condição analítica;
- período.

Ao alterar um filtro, todo o painel é recalculado: KPIs, gráficos, inconsistências, insights, tabela e exportações. Os chips mostram os filtros ativos e permitem removê-los individualmente.

Atalho: pressione `Ctrl + K` para posicionar o cursor na busca global.

## 5. Analisar gráficos

Cada card permite:

- ampliar o gráfico;
- exportar a visualização em PNG;
- consultar valores e percentuais no tooltip.

No gráfico de status, clique em um segmento para aplicar o respectivo status como filtro.

O gráfico **Percentual baixado × não baixado** inclui somente projetos elegíveis — orçamento positivo e baixa entre 0% e 100%. Nesses casos, a soma visual é sempre 100%. Projetos acima de 100% são classificados como excesso e tratados separadamente.

## 6. Consultar projetos e materiais

Na tabela de projetos:

1. clique nos títulos para ordenar;
2. selecione entre 10, 25, 50, 100, 250 ou 500 linhas por página;
3. clique em **Detalhes** para abrir os materiais do projeto.

O detalhamento mostra material, descrição, unidade, orçamento, baixa, saldo, percentual, reserva, movimento, data, centro, depósito, documento, item e validação.

## 7. Importar uma nova base

1. Clique em **Importar Nova Base SAP**.
2. Escolha um arquivo `.xlsx`, `.xls`, `.xlsm`, `.csv` ou `.json`.
3. Revise as abas encontradas.
4. Marque uma ou várias abas.
5. Confira o mapeamento automático.
6. Ajuste manualmente algum campo, se necessário.
7. Clique em **Consolidar e atualizar**.

O progresso mostra as etapas de leitura, identificação, mapeamento, validação, consolidação, cálculo e atualização.

Problemas não críticos não bloqueiam toda a importação. As ocorrências permanecem disponíveis no painel de inconsistências.

## 8. Estrutura recomendada da planilha

Use o botão **Baixar modelo de planilha**. Os campos mínimos são:

- Projeto;
- Código do Material;
- Quantidade Orçada;
- Quantidade Baixada.

Para obter todas as análises, inclua também contrato, descrições, unidade, reserva, movimento, data, centro, depósito, documento SAP e item SAP.

## 9. Exportar informações

As opções disponíveis são:

- dados filtrados em CSV;
- dados filtrados em JSON;
- resumo de projetos em CSV;
- detalhamento de materiais em CSV;
- inconsistências em CSV;
- relatório executivo para impressão;
- gráficos em PNG.

Os CSVs usam ponto e vírgula e BOM UTF-8, facilitando a abertura no Excel em português.

## 10. Privacidade e capacidade

Os dados importados são processados apenas na memória do navegador. Nenhuma base SAP é enviada pelo dashboard.

Não há limite fixo no código para projetos, registros, materiais ou abas. O limite prático depende da memória disponível. Para evitar travamentos, o processamento das linhas ocorre em blocos e a tabela renderiza somente a página atual.

## 11. Solução de problemas

### O dashboard abriu sem gráficos

Verifique a conexão com a internet, pois Chart.js é carregado por CDN. O projeto também possui cópias locais de contingência na pasta `assets/vendor`.

### As colunas não foram reconhecidas

Use o mapeamento manual exibido depois da seleção do arquivo. Consulte também `data/dicionario-campos.csv`.

### O arquivo é muito grande

Feche outras abas do navegador, tente em um computador com mais memória ou divida a extração em abas e importe somente as necessárias.

### A marca não aparece corretamente

Substitua `assets/logo-enel.svg` pela logomarca oficial autorizada, sem alterar o nome do arquivo.
