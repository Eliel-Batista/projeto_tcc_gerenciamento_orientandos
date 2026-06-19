# SIAOA - Sistema de Gerenciamento de Orientandos

O **SIAOA** é um sistema completo desenvolvido para facilitar o gerenciamento de orientandos e o acompanhamento de projetos acadêmicos e tarefas. A plataforma oferece suporte tanto para o perfil de **Orientador** quanto para o perfil de **Orientando**.

---

## 🚀 Arquitetura e Tecnologias

O projeto é dividido em duas frentes principais e um banco de dados relacional, orquestrados via Docker Compose.

### Backend (Java / Spring Boot)
- **Framework**: Spring Boot (Web, Validation, JPA)
- **Banco de Dados**: PostgreSQL (Produção) / H2 (Desenvolvimento/Testes)
- **Autenticação**: JWT (JSON Web Token)
- **Arquitetura**: Baseada em princípios de Clean Architecture (Domain, Application, Adapters, Infra)
- **Funcionalidades**: API RESTful para cadastro de usuários (Orientador/Orientando), gerenciamento de projetos, tarefas, metas, notificações e agenda.

### Frontend (React / Vite)
- **Framework**: React com TypeScript, utilizando Vite como bundler
- **Gerenciamento de Estado**: Zustand (`authStore` para sessão)
- **Integração com API**: Axios com interceptors para envio automático de tokens JWT
- **Roteamento**: React Router (com rotas públicas e rotas protegidas através de `PrivateRoute`)
- **Estilização**: TailwindCSS
- **Funcionalidades**: Dashboards específicos por perfil, formulários de login/registro com validação em tempo real, gerenciamento de projetos, tarefas e agenda.

### Infraestrutura
- **Docker & Docker Compose**: O projeto está containerizado para facilitar o ambiente de desenvolvimento e deploy.
- **Serviços configurados**:
  - `postgres` (Banco de Dados PostgreSQL 15)
  - `backend` (API Spring Boot exposta na porta 8080)
  - `frontend` (Aplicação React exposta na porta 3000)

---

## 📂 Estrutura do Repositório

- `/backend`: Código-fonte da API em Java.
- `/frontend`: Código-fonte da aplicação Web em React.
- `/docs`: Documentação técnica detalhada.
  - `/docs/project`: Resumos de implementação e checklists globais.
  - `/docs/backend`: Guias de integração, testes e detalhes de implementação do backend.
  - `/docs/frontend`: Guias de JWT, testes e gerenciamento de estado do frontend.
- `docker-compose.yml`: Arquivo de orquestração dos containers.

---

## 🛠️ Como Executar o Projeto

A maneira mais fácil de executar o projeto completo é utilizando o **Docker Compose**.

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados no seu ambiente.

### Passos para Execução com Docker

1. Certifique-se de que não há outras aplicações rodando nas portas `8080`, `3000` e `5432`.
2. Na raiz do projeto, execute o comando:
   ```bash
   docker-compose up --build
   ```
3. Aguarde a inicialização completa. O banco de dados iniciará primeiro, permitindo que o backend se conecte, seguido pela compilação do frontend.
4. **Acessos:**
   - **Interface Web (Frontend)**: [http://localhost:3000](http://localhost:3000)
   - **API REST (Backend)**: `http://localhost:8080/api`

### Execução para Desenvolvimento Local (Sem Docker)

Se preferir rodar os serviços separadamente na sua máquina local para desenvolvimento:

#### Backend
Certifique-se de ter o Java 17+ instalado e um banco de dados em execução.
```bash
cd backend
./mvnw spring-boot:run
```

#### Frontend
Certifique-se de ter o Node.js instalado.
```bash
cd frontend
npm install
npm run dev
```
*(O frontend será exposto normalmente em `http://localhost:5173` e consumirá a API definida no `.env.local`)*

---

## 🔒 Segurança e Autenticação

A plataforma utiliza tokens **JWT (JSON Web Token)** gerados no backend durante o login. Estes tokens são passados via header HTTP (`Authorization: Bearer <token>`) em todas as requisições privadas pelo frontend. O sistema prevê renovação e expiração de sessões e a senha dos usuários é fortemente protegida seguindo as melhores práticas do OWASP.

---

## 📚 Documentação Adicional

Para detalhes específicos sobre regras de negócio, testes e integração, consulte os guias disponíveis na pasta [`docs/`](./docs).
