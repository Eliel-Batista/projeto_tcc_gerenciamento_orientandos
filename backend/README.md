# Backend SIAOA

## Propósito

Esta pasta contém o backend Java Spring Boot do SIAOA, responsável pelas regras de negócio, persistência, autenticação e API REST consumida pelo frontend.

## Arquitetura proposta

- `domain/`: entidades de domínio e value objects
- `application/`: casos de uso e portas (interfaces)
- `adapters/`: controladores, DTOs, gateways e mapeadores
- `infra/`: detalhes de infraestrutura como banco, notificações e configurações do Spring

## Implementação atual

- `pom.xml` com Spring Boot Web, Validation, JPA, H2 e PostgreSQL
- `Application.java` com entrypoint Spring Boot
- `application.yml` com configuração H2 em memória e console habilitado
- `domain/entities/` com `Project` e `UserProfile`
- `application/usecases/` com `ProjectManagementUseCase` e `ProjectManagementService`
- `adapters/inbound/rest/` com `ProjectController` e DTOs
- `adapters/outbound/persistence/` com repositório in-memory
- `infra/config/` com bean de injeção para o repositório

## Próximo passo

1. Implementar autenticação e cadastro de usuários
2. Estender o domínio para tarefas, metas, notificações e agenda
3. Criar persistência real com JPA e PostgreSQL
