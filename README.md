# Luxury Store API

API REST desenvolvida em **TypeScript, Node.js e Express** para gerenciamento de uma loja de joias e acessórios de luxo.

O projeto foi desenvolvido com foco em separação de responsabilidades, autenticação, autorização baseada em papéis, validação de dados, persistência com PostgreSQL, testes automatizados e integração com uma aplicação frontend em Next.js.

---

## Tecnologias

### Backend

- TypeScript
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Docker
- Zod
- bcrypt
- JOSE / JWT
- Jest
- Supertest

### Frontend

A API possui uma aplicação frontend separada desenvolvida com:

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- React Hook Form
- Zod
- NextAuth

---

## Arquitetura

O backend utiliza separação em camadas:

```text
HTTP Request
     ↓
Middleware
     ↓
Routes
     ↓
Controllers
     ↓
Services
     ↓
Repositories
     ↓
Prisma ORM
     ↓
PostgreSQL
```

### Responsabilidades

**Routes**

Definem os endpoints e os middlewares utilizados em cada rota.

**Controllers**

Recebem as requisições HTTP e delegam a execução das regras de negócio aos Services.

**Services**

Concentram as regras de negócio da aplicação.

**Repositories**

Isolam o acesso ao banco de dados.

**Middlewares**

Responsáveis por autenticação, autorização, validação e tratamento de erros.

**Schemas**

Utilizam Zod para validar os dados recebidos pela API.

Essa organização evita concentrar regras de negócio diretamente nas rotas ou controllers e facilita testes e manutenção.

---

## Estrutura principal

```text
src/
├── controllers/
├── errors/
├── middlewares/
├── prisma/
├── repositories/
├── routes/
├── schemas/
├── scripts/
├── services/
├── __test__/
├── types/
├── app.ts
└── server.ts
```

---

## Banco de dados

A aplicação utiliza **PostgreSQL**.

Principais entidades:

```text
User
 └── Order
      └── OrderItem
           └── Product
                └── Category
```

## 🌐 Aplicação em produção

### Frontend

[Vercel](https://luxury-store-web.vercel.app/)

### API

https://prisma-first-test.onrender.com

---

## 🔐 Credenciais para avaliação

Para facilitar a avaliação das funcionalidades administrativas, foi disponibilizada uma conta de demonstração:

**Administrador**

- Email: `admin@luxury.com`
- Senha: `123456`

> Esta conta é destinada exclusivamente à demonstração e avaliação técnica do projeto.

Com ela é possível testar as funcionalidades protegidas por autorização administrativa, como gerenciamento de produtos.

### Usuário comum

Também é possível criar uma nova conta diretamente pela aplicação através da página de cadastro. Contas criadas pelo cadastro público recebem permissões de usuário comum.

### Valores monetários

Os valores monetários são armazenados como números inteiros representando centavos.

Exemplo:

```text
R$ 1.599,90
```

é armazenado como:

```text
159990
```

Essa abordagem evita problemas de precisão relacionados a números de ponto flutuante.

---

## Autenticação

A autenticação utiliza **JWT** com a biblioteca `jose`.

Fluxo:

```text
Login
  ↓
Validação das credenciais
  ↓
bcrypt.compare()
  ↓
JWT assinado
  ↓
Bearer Token
  ↓
authMiddleware
  ↓
Rota protegida
```

O token contém informações utilizadas para identificar o usuário e sua role.

---

## Autorização e RBAC

A aplicação implementa controle de acesso baseado em papéis (**Role-Based Access Control**).

Roles utilizadas:

```text
USER
ADMIN
```

Rotas administrativas utilizam:

```text
authMiddleware
      ↓
requireRole("ADMIN")
      ↓
Controller
```

Dessa forma, autenticação e autorização são responsabilidades distintas.

Um usuário autenticado pode possuir um token válido e ainda assim não possuir autorização para determinadas operações.

---

## Criação de administradores

Por segurança, o endpoint público de registro **não permite que o cliente escolha livremente a role `ADMIN`**.

Permitir algo como:

```json
{
  "email": "usuario@email.com",
  "password": "senha",
  "role": "ADMIN"
}
```

em uma rota pública permitiria uma possível escalada de privilégios.

Por isso, o provisionamento de administradores é realizado por uma CLI executada diretamente no ambiente da aplicação.

### Criar administrador

```bash
yarn admin:create "admin@luxury.com" "Administrador Luxury" "123456"
```

O comando:

1. verifica se o e-mail já está cadastrado;
2. valida a senha;
3. gera o hash utilizando bcrypt;
4. cria o usuário;
5. atribui explicitamente a role `ADMIN`.

Exemplo de retorno:

```text
Administrador criado com sucesso.
ID: 3
Nome: Administrador Luxury
Email: admin@luxury.com
Role: ADMIN
```

A senha e seu hash não são exibidos no terminal.

### Decisão arquitetural

A ausência de uma tela pública para criação de administradores é intencional.

Uma evolução prevista para o projeto é uma área de gerenciamento de usuários disponível exclusivamente para administradores autenticados:

```text
ADMIN autenticado
       ↓
Área administrativa
       ↓
Gerenciamento de usuários
       ↓
Criação/alteração de usuários autorizados
```

Essa funcionalidade deverá ser protegida pelo mesmo mecanismo de RBAC utilizado nas demais operações administrativas.

---

## Produtos

A API possui operações para:

```text
GET     /products
GET     /products/:id
POST    /products
PATCH   /products/:id
DELETE  /products/:id
```

As operações de criação, atualização e remoção são protegidas por autenticação e autorização administrativa.

---

## Soft Delete de produtos

Produtos que já fazem parte de pedidos possuem histórico relacionado em `OrderItem`.

Por isso, a exclusão de produtos utiliza **soft delete**.

Em vez de remover fisicamente o registro:

```text
DELETE Product
```

o produto é marcado como:

```text
active = false
```

Produtos inativos deixam de aparecer na listagem normal e não podem ser utilizados em novos pedidos.

Essa decisão preserva:

- integridade referencial;
- histórico de pedidos;
- informações de vendas anteriores.

---

## Pedidos

A aplicação permite:

```text
POST /orders
GET  /orders
GET  /orders/:id
```

Durante a criação de um pedido, a camada de serviço valida:

- existência do produto;
- disponibilidade do produto;
- estoque;
- preço armazenado no banco;
- quantidade solicitada.

O total do pedido é calculado no backend.

A aplicação não depende de valores monetários enviados pelo frontend para determinar o preço final.

---

## Segurança dos pedidos

Cada pedido pertence a um usuário.

Ao consultar um pedido específico, a aplicação considera tanto:

```text
orderId
```

quanto:

```text
userId
```

Isso impede que um usuário consulte diretamente pedidos pertencentes a outro usuário apenas alterando o ID na URL.

---

## Categorias

A aplicação disponibiliza categorias através de:

```text
GET /categories
```

As categorias são utilizadas no cadastro e edição dos produtos.

---

## Validação

A validação dos dados utiliza **Zod**.

Fluxo:

```text
Request
   ↓
validate(schema)
   ↓
Zod
   ↓
Controller
```

Dados inválidos são rejeitados antes de chegar às regras de negócio.

---

## Tratamento de erros

A aplicação possui uma classe de erro própria:

```text
AppError
```

e um middleware global de tratamento de erros.

Isso permite diferenciar erros esperados da aplicação de erros internos inesperados.

Exemplos:

```text
400 - Dados inválidos
401 - Não autenticado
403 - Acesso negado
404 - Recurso não encontrado
500 - Erro interno
```

---

## Testes

O projeto utiliza:

- Jest
- Supertest

Os testes cobrem diferentes camadas da aplicação, incluindo:

```text
Services
Controllers
Middlewares
Routes
```

Os testes de rota utilizam aplicações Express isoladas e Supertest para simular requisições HTTP.

Checkpoint atual do projeto:

```text
121 testes
121 passando
```

Para executar:

```bash
yarn test
```

---

## Variáveis de ambiente

Crie o arquivo `.env` utilizando `.env.example` como referência.

Exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/luxury_store?schema=public"

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=luxury_store

JWT_SECRET="defina-uma-chave-secreta-forte"
```

---

## Instalação

Clone o repositório e instale as dependências:

```bash
yarn install
```

Em seguida, configure:

```text
.env
```

a partir do arquivo:

```text
.env.example
```

---

## Prisma

O projeto utiliza Prisma com contrato localizado em:

```text
src/prisma/contract.prisma
```

Para emitir os artefatos do contrato:

```bash
yarn contract:emit
```

A configuração do Prisma está localizada em:

```text
prisma.config.ts
```

---

## Executando em desenvolvimento

Com o PostgreSQL disponível e as variáveis de ambiente configuradas:

```bash
yarn dev
```

A API fica disponível, por padrão, em:

```text
http://localhost:3000
```

---

## Docker

O projeto possui:

```text
Dockerfile
docker-compose.yml
.dockerignore
```

Para construir e iniciar os containers:

```bash
docker compose up --build -d
```

Verifique o estado:

```bash
docker compose ps
```

Para encerrar:

```bash
docker compose down
```

Na configuração de desenvolvimento atual:

```text
API
localhost:3000

PostgreSQL
localhost:5433
```

Dentro da rede Docker, a API acessa o PostgreSQL através do nome do serviço, utilizando a porta interna `5432`.

---

## Frontend

O frontend é uma aplicação separada desenvolvida em Next.js 14.

Fluxo principal:

```text
Next.js
   ↓
NextAuth
   ↓
Proxy /api/backend
   ↓
Express API
   ↓
PostgreSQL
```

O frontend utiliza React Query para gerenciamento das requisições e cache.

Formulários utilizam:

```text
React Hook Form
       ↓
Zod
       ↓
API
```

A interface utiliza Tailwind CSS e componentes baseados em shadcn/ui.

---

## Funcionalidades do frontend

Atualmente estão implementados:

- login;
- sessão com NextAuth;
- proteção das rotas de produtos;
- logout;
- listagem de produtos;
- filtros;
- paginação;
- cadastro de produtos;
- detalhes do produto;
- edição;
- exclusão lógica;
- seleção de categoria;
- estados de loading;
- tratamento de erros;
- estados vazios;
- layout responsivo.

---

## Build do frontend

O frontend foi validado utilizando:

```bash
yarn build
```

O build de produção conclui:

```text
Compiled successfully
Linting and checking validity of types
Generating static pages
Finalizing page optimization
```

---

## Decisões técnicas

Algumas decisões tomadas durante o desenvolvimento:

### Preços em centavos

Evita problemas de precisão com valores monetários.

### Soft delete

Preserva o histórico de pedidos e a integridade referencial.

### JWT + RBAC

Separa autenticação de autorização.

### CLI para administradores

Evita exposição de criação privilegiada em endpoint público.

### Camada de Services

Mantém regras de negócio fora dos controllers.

### Repository Pattern

Centraliza e isola o acesso ao banco.

### Zod

Valida dados antes que eles cheguem às regras de negócio.

### React Query

Gerencia cache, loading e atualização dos dados no frontend.

---

## Melhorias futuras

O projeto pode evoluir com:

- painel administrativo de usuários;
- gerenciamento de roles através de rotas protegidas;
- interface frontend para pedidos;
- gerenciamento completo de categorias;
- refresh token;
- Redis para cache;
- WebSockets para atualizações em tempo real;
- testes E2E completos;
- documentação OpenAPI/Swagger;
- observabilidade e logs estruturados;
- pipeline CI/CD;
- arquitetura hexagonal em módulos que justifiquem maior isolamento.

Essas funcionalidades não foram adicionadas apenas para aumentar a complexidade do projeto; a implementação atual prioriza uma base funcional, testável e com responsabilidades bem definidas.

---

## Fluxo geral

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                         NextAuth / JWT
                               │
                    ┌──────────▼──────────┐
                    │       Express       │
                    │         API         │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        Middlewares       Controllers       Validation
              │                │                │
              └────────────────┼────────────────┘
                               │
                           Services
                               │
                         Repositories
                               │
                         Prisma ORM
                               │
                         PostgreSQL
```

---

## Objetivo do projeto

O objetivo deste projeto é demonstrar a construção de uma aplicação full stack utilizando tecnologias modernas do ecossistema TypeScript, com atenção especial a:

- organização de código;
- regras de negócio;
- segurança;
- autenticação e autorização;
- banco de dados relacional;
- testes automatizados;
- integração frontend/backend;
- containerização;
- experiência do usuário.
