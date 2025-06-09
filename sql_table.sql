create table report
(
    report_id             bigint                     not null,
    workcase_id           bigint,
    content               text                       not null,
    tenant_code           varchar(50)                not null,
    version               integer      default 0     not null,
    created_by            varchar(255)               not null,
    created_at            timestamp with time zone   not null,
    updated_by            varchar(255)               not null,
    updated_at            timestamp with time zone   not null,
    report_content        json,
    resignation_id        varchar(255),
    status                smallint,
    study_id              bigint,
    report_type           varchar(255) default 'DOCTOR'::character varying,
    his_doctor_decided_by varchar(255),
    tele_tenant_code      varchar(50),
    medical_report        varchar(255),
    synced                boolean      default false not null,
    images                text
);


create table study
(
    study_id             bigint                      not null,
    study_instance_uid   varchar(512)                not null,
    temperature          numeric(3, 1),
    note                 text,
    status               varchar(20),
    type                 varchar(20),
    patient_id           bigint                      not null
    captured_date        timestamp with time zone    not null,
    tenant_code          varchar(50)                 not null,
    version              integer default 0           not null,
    created_by           varchar(255)                not null,
    created_at           timestamp with time zone    not null,
    updated_by           varchar(255)                not null,
    updated_at           timestamp with time zone    not null,
    age                  integer default 0           not null,
    symptoms_completed   char    default 'F'::bpchar not null,
    doctor_decided_by    varchar(255),
    doctor_decided_at    timestamp with time zone,
    description          varchar(2000),
    accession_number     varchar(100),
    editing_by           varchar(255),
    editing_at           timestamp with time zone,
    additional_note      text,
    qualified            varchar(20),
    imported_tenant_code varchar(50),
    assigned_tenant_code varchar(50),
    assigned_doctor      varchar(255),
    assigned_at          timestamp with time zone,
    diff_patient_name    varchar(255),
    telediagnosis_status varchar(20),
    ai_status            varchar(50),
    trigger_email        varchar(500),
    trigger_ai_at        timestamp with time zone,
    ai_note              text,
    dr_note              text,
    reported_by          varchar(255),
    reported_at          timestamp with time zone,
    synced               boolean default false       not null,
    local_mode           varchar(50),
    last_accessed_at     timestamp with time zone,
    last_accessed_by     varchar(50),
    symptom_info         text
);


create table patient
(
    patient_id    bigint                   not null,
    pid           varchar(50)              not null,
    first_name    varchar(255),
    last_name     varchar(255),
    date_of_birth date,
    nationality   char(2),
    gender        varchar(50),
    phone_number  varchar(255),
    location      varchar(255),
    tenant_code   varchar(50)              not null,
    version       integer default 0        not null,
    created_by    varchar(255)             not null,
    created_at    timestamp with time zone not null,
    updated_by    varchar(255)             not null,
    updated_at    timestamp with time zone not null,
    email         varchar(255)
);


create table print_template
(
    print_id         bigint                                            not null,
    tenant_code      varchar(50)                                       not null,
    name             varchar(255)                                      not null,
    content          text                                              not null,
    version          integer      default 0                            not null,
    created_by       varchar(255)                                      not null,
    created_at       timestamp with time zone                          not null,
    updated_by       varchar(255)                                      not null,
    updated_at       timestamp with time zone                          not null,
    deleted          char         default 'F'::bpchar                  not null,
    master           char         default 'T'::bpchar                  not null,
    modality         varchar(50)  default NULL::character varying,
    body_part        varchar(255) default NULL::character varying,
    template_type    varchar(50)  default 'CONTENT'::character varying not null,
    description      text,
    conclusion       text,
    recommendation   text,
    default_template char         default 'F'::bpchar                  not null
);
