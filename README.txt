MestreXit - versão modular

Estrutura:
- index.html
- assets/css/style-XX.css
- assets/js/module-XX.js
- config/

Esta versão separa CSS e JavaScript do HTML e usa nomes/estrutura de arquivos menos óbvios.
IMPORTANTE: isso não torna código de navegador impossível de extrair. Tudo enviado ao browser pode ser inspecionado.
Para proteção real da lógica de Key, mova validação/decisões sensíveis para um backend/API e use regras de segurança do Firebase.
