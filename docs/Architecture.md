# Architecture Documentation

## SAP CRM Sales Process Simulator

---

## Application Architecture Overview

```mermaid
graph TB
    subgraph Browser
        A[Angular 20 SPA]
    end

    subgraph Angular App
        B[App Component]
        B --> C[Auth Module]
        B --> D[Shell Component]
        D --> E[Dashboard]
        D --> F[Business Partner]
        D --> G[Lead Management]
        D --> H[Opportunity]
        D --> I[Activity]
        D --> J[Quotes]
        D --> K[Reports]
    end

    subgraph Core Layer
        L[AuthService]
        M[CustomerService]
        N[LeadService]
        O[OpportunityService]
        P[ActivityService]
        Q[QuoteService]
        R[ApiService Base]
        L & M & N & O & P & Q --> R
    end

    subgraph Mock Backend
        S[JSON Server :3000]
        T[(db.json)]
        S --> T
    end

    R -->|HTTP| S
    C --> L
```

---

## Module Structure

```mermaid
graph LR
    subgraph Lazy Loaded Modules
        A[auth] -->|/auth/login| L[LoginComponent]
        B[business-partner] -->|/customers| BL[BpListComponent]
        B --> BF[BpFormComponent]
        B --> BD[BpDetailComponent]
        C[lead-management] -->|/leads| LL[LeadListComponent]
        C --> LF[LeadFormComponent]
        C --> LD[LeadDetailComponent]
        D[opportunity] -->|/opportunities| OL[OppListComponent]
        D --> OF[OppFormComponent]
        D --> OD[OppDetailComponent]
        E[activity] -->|/activities| AL[ActivityListComponent]
        E --> AF[ActivityFormComponent]
        F[quotes] -->|/quotes| QL[QuoteListComponent]
        F --> QF[QuoteFormComponent]
        F --> QD[QuoteDetailComponent]
        G[reports] -->|/reports| R[ReportsComponent]
    end
```

---

## Data Model

```mermaid
erDiagram
    CUSTOMER {
        string id PK
        string name
        string email
        string industry
        string accountType
        string status
        number revenue
        string assignedRep
    }

    LEAD {
        string id PK
        string title
        string customerId FK
        string status
        string priority
        string assignedRep
        number estimatedValue
        string convertedOpportunityId FK
    }

    OPPORTUNITY {
        string id PK
        string title
        string customerId FK
        string leadId FK
        string stage
        number probability
        number expectedRevenue
        string expectedCloseDate
        string assignedRep
    }

    ACTIVITY {
        string id PK
        string type
        string subject
        string customerId FK
        string opportunityId FK
        string status
        string assignedTo
        string dueDate
    }

    QUOTE {
        string id PK
        string title
        string opportunityId FK
        string customerId FK
        string status
        number subtotal
        number tax
        number total
        string approvedBy
    }

    QUOTE_LINE_ITEM {
        string productId FK
        string product
        number quantity
        number unitPrice
        number discount
        number total
    }

    CUSTOMER ||--o{ LEAD : "has"
    CUSTOMER ||--o{ OPPORTUNITY : "has"
    CUSTOMER ||--o{ ACTIVITY : "has"
    LEAD ||--o| OPPORTUNITY : "converts to"
    OPPORTUNITY ||--o{ ACTIVITY : "has"
    OPPORTUNITY ||--o{ QUOTE : "has"
    QUOTE ||--|{ QUOTE_LINE_ITEM : "contains"
```

---

## SAP CRM Sales Process Flow

```mermaid
flowchart LR
    A([Lead Capture]) --> B{Qualification}
    B -->|Qualified| C[Create Opportunity]
    B -->|Not Qualified| D([Lost])
    C --> E[Discovery]
    E --> F[Proposal]
    F --> G[Negotiation]
    G --> H{Decision}
    H -->|Won| I[Create Quote]
    H -->|Lost| J([Closed Lost])
    I --> K{Approval}
    K -->|Approved| L([Closed Won])
    K -->|Rejected| M[Revise Quote]
    M --> K

    style A fill:#0a6ed1,color:#fff
    style L fill:#107e3e,color:#fff
    style D fill:#bb0000,color:#fff
    style J fill:#bb0000,color:#fff
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as LoginComponent
    participant AS as AuthService
    participant API as JSON Server
    participant R as Router

    U->>L: Enter credentials
    L->>AS: login(username, password)
    AS->>API: GET /users?username=x&password=y
    API-->>AS: User[] or []
    alt User found
        AS->>AS: Set auth signal + sessionStorage
        AS-->>L: User object
        L->>R: navigate('/dashboard')
    else Not found
        AS-->>L: throw Error
        L->>U: Show error message
    end
```

---

## Component Communication Pattern

```mermaid
graph TD
    subgraph Signal-based State
        A[AuthService.authState signal]
        B[AuthService.currentUser computed]
        C[AuthService.isManager computed]
    end

    subgraph Components
        D[ShellComponent] -->|reads| B
        E[QuoteListComponent] -->|reads| C
        F[QuoteDetailComponent] -->|reads| C
    end

    subgraph Services
        G[CustomerService] -->|extends| H[ApiService]
        I[LeadService] -->|extends| H
        J[OpportunityService] -->|extends| H
        K[ActivityService] -->|extends| H
        L[QuoteService] -->|extends| H
    end

    H -->|HttpClient| M[(JSON Server)]
```

---

## Deployment Architecture

```mermaid
graph LR
    subgraph Development
        A[ng serve :4200]
        B[json-server :3000]
    end

    subgraph Production
        C[GitHub Pages]
        D[Static Angular Build]
        E[Embedded static data / localStorage]
    end

    A -->|API calls| B
    D --> C
```
