--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CostType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CostType" AS ENUM (
    'FIXED',
    'DIRECT'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Aircraft; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Aircraft" (
    id text NOT NULL,
    "tailNumber" text NOT NULL,
    type text NOT NULL,
    "baseAirport" text NOT NULL,
    "fiscalYearStartMonth" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Attachment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attachment" (
    id text NOT NULL,
    filename text NOT NULL,
    url text NOT NULL,
    size integer NOT NULL,
    "mimeType" text NOT NULL,
    "costEntryId" text,
    "tripId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: CostCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CostCategory" (
    id text NOT NULL,
    name text NOT NULL,
    type public."CostType" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    archived boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CostEntry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CostEntry" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "categoryId" text NOT NULL,
    vendor text,
    "invoiceNumber" text,
    amount numeric(12,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: DutyDayLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DutyDayLog" (
    id text NOT NULL,
    "pilotId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "reportTime" timestamp(3) without time zone NOT NULL,
    "dutyEndTime" timestamp(3) without time zone NOT NULL,
    "restPeriodBeforeHours" numeric(6,2) NOT NULL,
    "splitDutyApplied" boolean DEFAULT false NOT NULL,
    "splitDutyNote" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Passenger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Passenger" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Pilot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Pilot" (
    id text NOT NULL,
    name text NOT NULL,
    archived boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RegulatorySettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RegulatorySettings" (
    id text NOT NULL,
    "maxFlightDutyHours" numeric(4,2) DEFAULT 14 NOT NULL,
    "extendedMaxFlightDutyHours" numeric(4,2) DEFAULT 15 NOT NULL,
    "rolling30DayFlightHoursLimit" numeric(5,2) DEFAULT 70 NOT NULL,
    "extensionRestPeriodHours" numeric(4,2) DEFAULT 24 NOT NULL,
    "minRestPeriodHours" numeric(4,2) DEFAULT 36 NOT NULL,
    "restPeriodWindowDays" integer DEFAULT 7 NOT NULL,
    "splitDutyMaxExtensionHours" numeric(4,2) DEFAULT 4 NOT NULL,
    "splitDutyMinRestHours" numeric(4,2) DEFAULT 4 NOT NULL,
    "currencyTakeoffsRequired" integer DEFAULT 5 NOT NULL,
    "currencyLandingsRequired" integer DEFAULT 5 NOT NULL,
    "currencyPeriodMonths" integer DEFAULT 6 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Trip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Trip" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "departureAirport" text NOT NULL,
    "arrivalAirport" text NOT NULL,
    "routeLabel" text,
    hours numeric(6,2) NOT NULL,
    cycles integer DEFAULT 1 NOT NULL,
    miles integer DEFAULT 0 NOT NULL,
    purpose text,
    notes text,
    "pilotId" text,
    "dayTakeoffs" integer DEFAULT 0 NOT NULL,
    "dayLandings" integer DEFAULT 0 NOT NULL,
    "nightTakeoffs" integer DEFAULT 0 NOT NULL,
    "nightLandings" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TripPassenger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TripPassenger" (
    "tripId" text NOT NULL,
    "passengerId" text NOT NULL
);


--
-- Data for Name: Aircraft; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Aircraft" (id, "tailNumber", type, "baseAirport", "fiscalYearStartMonth", "createdAt", "updatedAt") VALUES ('cmrsmyn230000rf7d6tef066m', 'C-FPFX', 'Cessna Citation 750 (Citation X)', 'CYWG — Winnipeg, MB', 1, '2026-07-20 02:59:13.851', '2026-07-20 02:59:13.851');


--
-- Data for Name: Attachment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: CostCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn2y0001rf7dcs5sf3bh', 'Hangar', 'FIXED', 0, false, '2026-07-20 02:59:13.882', '2026-07-20 02:59:13.882');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn4j0002rf7dhh8i6vdn', 'Pilot Salary', 'FIXED', 1, false, '2026-07-20 02:59:13.939', '2026-07-20 02:59:13.939');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn4p0003rf7djkf9yfav', 'Insurance', 'FIXED', 2, false, '2026-07-20 02:59:13.945', '2026-07-20 02:59:13.945');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn4t0004rf7djyazi1oy', 'Training', 'FIXED', 3, false, '2026-07-20 02:59:13.949', '2026-07-20 02:59:13.949');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn4x0005rf7dorvpuaw5', 'Publications', 'FIXED', 4, false, '2026-07-20 02:59:13.953', '2026-07-20 02:59:13.953');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn550006rf7dh9ep7eho', 'Nav Canada', 'DIRECT', 0, false, '2026-07-20 02:59:13.961', '2026-07-20 02:59:13.961');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn5b0007rf7drbdhp1ct', 'Crew Expenses', 'DIRECT', 1, false, '2026-07-20 02:59:13.967', '2026-07-20 02:59:13.967');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn5g0008rf7d8etj0tnq', 'Catering', 'DIRECT', 2, false, '2026-07-20 02:59:13.972', '2026-07-20 02:59:13.972');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn5k0009rf7dq67qijec', 'Parking/Customs/Landing', 'DIRECT', 3, false, '2026-07-20 02:59:13.976', '2026-07-20 02:59:13.976');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn5o000arf7d8byn4fsd', 'Maintenance', 'DIRECT', 4, false, '2026-07-20 02:59:13.98', '2026-07-20 02:59:13.98');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn5s000brf7d864ytk21', 'Fuel', 'DIRECT', 5, false, '2026-07-20 02:59:13.984', '2026-07-20 02:59:13.984');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn5w000crf7dx9ix3za4', 'WAA', 'DIRECT', 6, false, '2026-07-20 02:59:13.988', '2026-07-20 02:59:13.988');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn5z000drf7dzxl20pjf', 'Fast Air', 'DIRECT', 7, false, '2026-07-20 02:59:13.991', '2026-07-20 02:59:13.991');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn65000erf7dl90q1gk8', 'RRCC', 'DIRECT', 8, false, '2026-07-20 02:59:13.997', '2026-07-20 02:59:13.997');
INSERT INTO public."CostCategory" (id, name, type, "sortOrder", archived, "createdAt", "updatedAt") VALUES ('cmrsmyn69000frf7ddluiy4gl', 'Gogo', 'DIRECT', 9, false, '2026-07-20 02:59:14.001', '2026-07-20 02:59:14.001');


--
-- Data for Name: CostEntry; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aja001xp07d0u2olppj', '2026-01-01 00:00:00', 'cmrsmyn550006rf7dh9ep7eho', NULL, 'CS440255', 343.37, NULL, '2026-07-20 03:34:43.798', '2026-07-20 03:34:43.798');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aje001yp07dinpovqyh', '2026-02-01 00:00:00', 'cmrsmyn550006rf7dh9ep7eho', NULL, 'CS441743', 373.34, NULL, '2026-07-20 03:34:43.802', '2026-07-20 03:34:43.802');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ajh001zp07darrm7f12', '2026-03-01 00:00:00', 'cmrsmyn550006rf7dh9ep7eho', NULL, 'CS443294', 689.45, NULL, '2026-07-20 03:34:43.805', '2026-07-20 03:34:43.805');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ajk0020p07dpuxxoz8w', '2026-04-01 00:00:00', 'cmrsmyn550006rf7dh9ep7eho', NULL, 'CS444837', 1101.16, NULL, '2026-07-20 03:34:43.808', '2026-07-20 03:34:43.808');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ajn0021p07dmkw1jsoo', '2026-06-01 00:00:00', 'cmrsmyn550006rf7dh9ep7eho', NULL, 'CS448453', 1083.46, NULL, '2026-07-20 03:34:43.811', '2026-07-20 03:34:43.811');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ajv0022p07d6stdcn5i', '2026-01-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '7644833', 0.00, NULL, '2026-07-20 03:34:43.819', '2026-07-20 03:34:43.819');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ajy0023p07d4k96rgdp', '2026-02-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '24037565.0', 7120.32, 'KMCO', '2026-07-20 03:34:43.822', '2026-07-20 03:34:43.822');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ak10024p07d1vkl7ul0', '2026-02-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8419261.0', 78.63, 'Lav service', '2026-07-20 03:34:43.825', '2026-07-20 03:34:43.825');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ak40025p07ducwwn6bs', '2026-02-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8433803.0', 3008.17, 'CYWG - KPHX', '2026-07-20 03:34:43.828', '2026-07-20 03:34:43.828');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ak60026p07dp674clcl', '2026-03-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8450764.0', 2679.96, 'KPHX - CYWG', '2026-07-20 03:34:43.83', '2026-07-20 03:34:43.83');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ak90027p07do24bgcl9', '2026-03-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8512744.0', 4948.31, 'KSTP x 2, CYWG', '2026-07-20 03:34:43.833', '2026-07-20 03:34:43.833');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8akb0028p07dgnmjzf0b', '2026-03-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8532907.0', 7318.41, 'CYWG - TUPJ', '2026-07-20 03:34:43.835', '2026-07-20 03:34:43.835');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ake0029p07dece1lq6a', '2026-04-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8549773.0', 10682.25, 'KJAX x 3', '2026-07-20 03:34:43.838', '2026-07-20 03:34:43.838');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8akh002ap07d4mjs5wjk', '2026-04-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '24378674.0', 2841.81, 'KRIC - KRDU', '2026-07-20 03:34:43.841', '2026-07-20 03:34:43.841');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8akk002bp07dxh6rj3dy', '2026-04-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8561885.0', 10296.18, 'CYWG & KRDU', '2026-07-20 03:34:43.844', '2026-07-20 03:34:43.844');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8akm002cp07dxn1imm56', '2026-04-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8573845.0', 5942.50, 'TUPJ fees', '2026-07-20 03:34:43.846', '2026-07-20 03:34:43.846');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8akp002dp07doocvmndt', '2026-05-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8621902.0', 9615.80, 'CYWG, KBJC, KSGU', '2026-07-20 03:34:43.849', '2026-07-20 03:34:43.849');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8akr002ep07defvw1cyb', '2026-04-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8597853.0', 14837.64, 'CYWG, KPSP', '2026-07-20 03:34:43.851', '2026-07-20 03:34:43.851');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aku002fp07def1ucntt', '2026-05-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8641242.0', 7344.97, 'TUPJ - KJAX fuel', '2026-07-20 03:34:43.854', '2026-07-20 03:34:43.854');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8akx002gp07d45witn76', '2026-06-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8697017.0', 12461.25, 'CYWG, KMHR, KVNY', '2026-07-20 03:34:43.857', '2026-07-20 03:34:43.857');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8al2002hp07dtrtvhx5l', '2026-06-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8718977.0', 5848.29, 'CYWG, KYIP', '2026-07-20 03:34:43.862', '2026-07-20 03:34:43.862');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8al5002ip07dfj0h5tgf', '2026-06-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8738991.0', 9216.78, 'CYWG, KMDW', '2026-07-20 03:34:43.865', '2026-07-20 03:34:43.865');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8al8002jp07dxpzpbtb0', '2026-07-01 00:00:00', 'cmrsmyn5s000brf7d864ytk21', NULL, '8789946.0', 3740.51, 'CYWG-CYYQ-CYWG', '2026-07-20 03:34:43.868', '2026-07-20 03:34:43.868');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8alh002kp07dscca3o4g', '2026-01-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, 'IN376966', 10325.00, 'CAMP', '2026-07-20 03:34:43.877', '2026-07-20 03:34:43.877');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8alk002lp07d0mnqefar', '2026-01-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, 'A000TD27694', 835.01, 'EGPWS', '2026-07-20 03:34:43.88', '2026-07-20 03:34:43.88');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aln002mp07dxs1jcrey', '2026-01-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, 'A46AB45993', 11935.00, 'NZ 6.1 NAVDB', '2026-07-20 03:34:43.883', '2026-07-20 03:34:43.883');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8alq002np07dfhszh9gf', '2026-01-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, '91569967.0', 3833.47, 'Hydraulic Filters', '2026-07-20 03:34:43.886', '2026-07-20 03:34:43.886');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8alt002op07dgyytsplu', '2026-01-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, '91567958.0', 73530.00, 'Deposit invoice MCO', '2026-07-20 03:34:43.889', '2026-07-20 03:34:43.889');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8alw002pp07duj5qo2ki', '2026-01-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, NULL, 152124.71, 'KMCO', '2026-07-20 03:34:43.892', '2026-07-20 03:34:43.892');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8alz002qp07d08g9xjvx', '2026-02-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, '91574175.0', -8744.53, 'KMCO', '2026-07-20 03:34:43.895', '2026-07-20 03:34:43.895');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8am2002rp07dkivjha7n', '2026-02-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, 'IJ17205391', 4603.19, 'Brake cable', '2026-07-20 03:34:43.898', '2026-07-20 03:34:43.898');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8am4002sp07dvepiv4nw', '2026-03-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, '91583913.0', 3467.00, 'MM/IPC renewal', '2026-07-20 03:34:43.9', '2026-07-20 03:34:43.9');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8am7002tp07dvoxq3y0g', '2026-04-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, '91585869.0', 14619.60, 'AOG KJAX', '2026-07-20 03:34:43.903', '2026-07-20 03:34:43.903');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ama002up07d7i9sd9y5', '2026-04-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, '69669.0', 95870.47, 'CDN Fast Air YD computer and shipping', '2026-07-20 03:34:43.906', '2026-07-20 03:34:43.906');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8amc002vp07d241l53s4', '2026-03-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, 'IN9330', 67407.20, 'CDN Hope Aero for main wheel assembly', '2026-07-20 03:34:43.908', '2026-07-20 03:34:43.908');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8amg002wp07dw29iq17g', '2026-04-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, '91586196.0', 11901.36, 'KMCO AOG', '2026-07-20 03:34:43.912', '2026-07-20 03:34:43.912');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ami002xp07dzz4z81s5', '2026-06-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, 'IJ17514503', 1704.86, 'Jack pad kit', '2026-07-20 03:34:43.914', '2026-07-20 03:34:43.914');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8amm002yp07d7yad7my6', '2026-10-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, NULL, 9.00, NULL, '2026-07-20 03:34:43.918', '2026-07-20 03:34:43.918');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8amo002zp07dgle0wp0j', '2026-11-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, NULL, 10.00, NULL, '2026-07-20 03:34:43.92', '2026-07-20 03:34:43.92');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8amr0030p07d9xeveokn', '2026-12-01 00:00:00', 'cmrsmyn5o000arf7d8byn4fsd', NULL, NULL, 11.00, NULL, '2026-07-20 03:34:43.923', '2026-07-20 03:34:43.923');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8amv0031p07dcumlo2ku', '2026-01-01 00:00:00', 'cmrsmyn5w000crf7dx9ix3za4', NULL, 'S-', 0.00, NULL, '2026-07-20 03:34:43.927', '2026-07-20 03:34:43.927');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8amy0032p07dy7suu3ew', '2026-02-01 00:00:00', 'cmrsmyn5w000crf7dx9ix3za4', NULL, 'S-27304', 780.66, NULL, '2026-07-20 03:34:43.93', '2026-07-20 03:34:43.93');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8an10033p07d9oc9sic9', '2026-03-01 00:00:00', 'cmrsmyn5w000crf7dx9ix3za4', NULL, 'S-27772', 380.33, NULL, '2026-07-20 03:34:43.933', '2026-07-20 03:34:43.933');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8an30034p07dyb4k0ajo', '2026-04-01 00:00:00', 'cmrsmyn5w000crf7dx9ix3za4', NULL, 'S-28185', 1521.32, NULL, '2026-07-20 03:34:43.935', '2026-07-20 03:34:43.935');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8an60035p07dbzysbkbb', '2026-06-01 00:00:00', 'cmrsmyn5w000crf7dx9ix3za4', NULL, 'S-29137', 1064.70, NULL, '2026-07-20 03:34:43.938', '2026-07-20 03:34:43.938');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8anb0036p07d4nvz3jwy', '2026-01-01 00:00:00', 'cmrsmyn5z000drf7dzxl20pjf', NULL, '67090.0', 0.00, NULL, '2026-07-20 03:34:43.943', '2026-07-20 03:34:43.943');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8anf0037p07dsk7da009', '2026-05-01 00:00:00', 'cmrsmyn5z000drf7dzxl20pjf', NULL, '70080.0', 1615.75, 'CAD', '2026-07-20 03:34:43.947', '2026-07-20 03:34:43.947');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ano0038p07dx1ycl08o', '2026-01-01 00:00:00', 'cmrsmyn65000erf7dl90q1gk8', NULL, '2026-01', 18941.00, NULL, '2026-07-20 03:34:43.956', '2026-07-20 03:34:43.956');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8anr0039p07d6fszh1eg', '2026-02-01 00:00:00', 'cmrsmyn65000erf7dl90q1gk8', NULL, '2026-02', 18941.00, NULL, '2026-07-20 03:34:43.959', '2026-07-20 03:34:43.959');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ao1003ap07dg9zgo0t2', '2026-04-01 00:00:00', 'cmrsmyn69000frf7ddluiy4gl', NULL, 'April', 1022.56, NULL, '2026-07-20 03:34:43.969', '2026-07-20 03:34:43.969');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ao4003bp07d5y77z6cm', '2026-05-01 00:00:00', 'cmrsmyn69000frf7ddluiy4gl', NULL, '2026-05-01 00:00:00', 834.40, NULL, '2026-07-20 03:34:43.972', '2026-07-20 03:34:43.972');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ao7003cp07d4ujpctee', '2026-06-01 00:00:00', 'cmrsmyn69000frf7ddluiy4gl', NULL, NULL, 750.40, NULL, '2026-07-20 03:34:43.975', '2026-07-20 03:34:43.975');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aoa003dp07discc49kj', '2026-07-01 00:00:00', 'cmrsmyn69000frf7ddluiy4gl', NULL, NULL, 814.81, NULL, '2026-07-20 03:34:43.978', '2026-07-20 03:34:43.978');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aog003ep07doaiaaw4f', '2026-01-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.984', '2026-07-20 03:34:43.984');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aoi003fp07dak2wtiaw', '2026-02-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.986', '2026-07-20 03:34:43.986');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aol003gp07dc51u2qst', '2026-03-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.989', '2026-07-20 03:34:43.989');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aon003hp07dbaomy7m4', '2026-04-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.991', '2026-07-20 03:34:43.991');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aoo003ip07dyl4azxwx', '2026-05-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.992', '2026-07-20 03:34:43.992');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aor003jp07dawxwlnkn', '2026-06-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.995', '2026-07-20 03:34:43.995');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aos003kp07dh57zbyxx', '2026-07-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.996', '2026-07-20 03:34:43.996');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aou003lp07do3gn3zll', '2026-08-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:43.998', '2026-07-20 03:34:43.998');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aow003mp07dd9frawcv', '2026-09-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44', '2026-07-20 03:34:44');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aoy003np07df01r5i2b', '2026-10-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.002', '2026-07-20 03:34:44.002');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ap0003op07db3kizw3a', '2026-11-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.004', '2026-07-20 03:34:44.004');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ap2003pp07d52lflm7p', '2026-12-01 00:00:00', 'cmrsmyn2y0001rf7dcs5sf3bh', NULL, NULL, 10095.75, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.006', '2026-07-20 03:34:44.006');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ap5003qp07d48ysde5t', '2026-01-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 36332.89, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.009', '2026-07-20 03:34:44.009');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ap7003rp07d998jn7te', '2026-02-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 36332.89, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.011', '2026-07-20 03:34:44.011');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ap9003sp07dfh2bte23', '2026-03-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 36332.89, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.013', '2026-07-20 03:34:44.013');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apb003tp07dg7ik73c5', '2026-04-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.015', '2026-07-20 03:34:44.015');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apc003up07d3szqp5w0', '2026-05-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.016', '2026-07-20 03:34:44.016');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ape003vp07dpe26e5oq', '2026-06-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.018', '2026-07-20 03:34:44.018');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apf003wp07d5wuau4kp', '2026-07-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.019', '2026-07-20 03:34:44.019');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aph003xp07d19gjik3r', '2026-08-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.021', '2026-07-20 03:34:44.021');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apj003yp07dugll4au2', '2026-09-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.023', '2026-07-20 03:34:44.023');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apl003zp07d578xrcux', '2026-10-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.025', '2026-07-20 03:34:44.025');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apn0040p07db8euicnf', '2026-11-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.027', '2026-07-20 03:34:44.027');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apo0041p07d5yoczh0l', '2026-12-01 00:00:00', 'cmrsmyn4j0002rf7dhh8i6vdn', NULL, NULL, 31957.90, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.028', '2026-07-20 03:34:44.028');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apr0042p07dui9q1ghm', '2026-01-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.031', '2026-07-20 03:34:44.031');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apt0043p07d3htm9gpx', '2026-02-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.033', '2026-07-20 03:34:44.033');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apv0044p07dymlk3fvo', '2026-03-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.035', '2026-07-20 03:34:44.035');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apx0045p07dc3ue4bvl', '2026-04-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.037', '2026-07-20 03:34:44.037');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8apy0046p07dtv8llyqk', '2026-05-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.038', '2026-07-20 03:34:44.038');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aq00047p07dpzye6o8f', '2026-06-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.04', '2026-07-20 03:34:44.04');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aq20048p07dkjavuhwv', '2026-07-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.042', '2026-07-20 03:34:44.042');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aq30049p07dnfdk5stl', '2026-08-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.043', '2026-07-20 03:34:44.043');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aq5004ap07dx7rhpzoz', '2026-09-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.045', '2026-07-20 03:34:44.045');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aq7004bp07d1xankwsz', '2026-10-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.047', '2026-07-20 03:34:44.047');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aq9004cp07dlxwd6u9l', '2026-11-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.049', '2026-07-20 03:34:44.049');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqb004dp07dhc9fr4bo', '2026-12-01 00:00:00', 'cmrsmyn4p0003rf7djkf9yfav', NULL, NULL, 2392.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.052', '2026-07-20 03:34:44.052');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqf004ep07d7y8x68jn', '2026-01-01 00:00:00', 'cmrsmyn4t0004rf7djyazi1oy', NULL, NULL, 51450.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.055', '2026-07-20 03:34:44.055');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqi004fp07ddloihc9v', '2026-05-01 00:00:00', 'cmrsmyn4t0004rf7djyazi1oy', NULL, NULL, 4241.62, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.058', '2026-07-20 03:34:44.058');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aql004gp07d7qo7nou2', '2026-10-01 00:00:00', 'cmrsmyn4t0004rf7djyazi1oy', NULL, NULL, 1790.25, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.061', '2026-07-20 03:34:44.061');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqn004hp07dzvcsavi8', '2026-11-01 00:00:00', 'cmrsmyn4t0004rf7djyazi1oy', NULL, NULL, 358.35, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.063', '2026-07-20 03:34:44.063');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqr004ip07dz3dup5sv', '2026-03-01 00:00:00', 'cmrsmyn4x0005rf7dorvpuaw5', NULL, NULL, 3785.25, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.067', '2026-07-20 03:34:44.067');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqt004jp07d83pegr2t', '2026-04-01 00:00:00', 'cmrsmyn4x0005rf7dorvpuaw5', NULL, NULL, 6274.50, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.069', '2026-07-20 03:34:44.069');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqv004kp07diqndcpwg', '2026-07-01 00:00:00', 'cmrsmyn4x0005rf7dorvpuaw5', NULL, NULL, 764.64, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.071', '2026-07-20 03:34:44.071');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8aqx004lp07dlea781sx', '2026-08-01 00:00:00', 'cmrsmyn4x0005rf7dorvpuaw5', NULL, NULL, 9550.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.073', '2026-07-20 03:34:44.073');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ar0004mp07dkd249vp1', '2026-10-01 00:00:00', 'cmrsmyn4x0005rf7dorvpuaw5', NULL, NULL, 1801.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.076', '2026-07-20 03:34:44.076');
INSERT INTO public."CostEntry" (id, date, "categoryId", vendor, "invoiceNumber", amount, notes, "createdAt", "updatedAt") VALUES ('cmrso8ar2004np07dasubcrbl', '2026-11-01 00:00:00', 'cmrsmyn4x0005rf7dorvpuaw5', NULL, NULL, 4300.00, 'Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)', '2026-07-20 03:34:44.078', '2026-07-20 03:34:44.078');


--
-- Data for Name: DutyDayLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Passenger; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a6e0001p07d9ac5whop', 'Brock Pollard', '2026-07-20 03:34:43.334');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a6q0002p07d5j8m3e61', 'Jacqueline Pollard', '2026-07-20 03:34:43.346');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a6x0003p07dr892vpma', 'Jarett Nick', '2026-07-20 03:34:43.353');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a740004p07dxyyrw4fd', 'Florence Nick', '2026-07-20 03:34:43.36');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a7a0005p07dpe3466tl', 'Katelyn Wilson', '2026-07-20 03:34:43.366');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a7r0009p07dsgkwzs8h', 'Evan Pollard', '2026-07-20 03:34:43.383');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a7x000ap07d3av4kpqu', 'Doug Pollard', '2026-07-20 03:34:43.389');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a82000bp07djhlh3i5p', 'Mike Pollard', '2026-07-20 03:34:43.394');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a88000cp07dvqgw7gku', 'Eric Pollard', '2026-07-20 03:34:43.4');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a8c000dp07dgerp51oh', 'Sarah Den Ouden', '2026-07-20 03:34:43.405');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a8h000ep07dgbxjk6d9', 'Krista Stepa-Ammeter', '2026-07-20 03:34:43.409');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a8m000fp07d6djjl254', 'Jennifer Wankling', '2026-07-20 03:34:43.414');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a8q000gp07d7s91u0jo', 'Byron Peterson', '2026-07-20 03:34:43.418');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a9a000ip07d89h4ldbn', 'Julia Cloutier', '2026-07-20 03:34:43.438');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a9f000jp07dag0i387o', 'Manpreet Atwal', '2026-07-20 03:34:43.443');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a9n000lp07d7bmql6yt', 'John Pollard', '2026-07-20 03:34:43.451');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8a9s000mp07d8fq5iftr', 'Steven Fingold', '2026-07-20 03:34:43.456');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8aak000pp07d268vaeef', 'Kristan Pearson', '2026-07-20 03:34:43.484');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8aap000qp07dxc2u9wr8', 'Parker Pollard', '2026-07-20 03:34:43.489');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8aat000rp07d5znud2vu', 'Maxwell Pollard', '2026-07-20 03:34:43.493');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8act0012p07din07poqp', 'Gordon Pollard', '2026-07-20 03:34:43.565');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8ad00013p07dvzr4k5fx', 'Susan Pollard', '2026-07-20 03:34:43.572');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8adi0015p07drvcfxakr', 'Celso Pedroso', '2026-07-20 03:34:43.59');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8adr0017p07d6iqs9gl1', 'Shannon DeHaven', '2026-07-20 03:34:43.599');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8ae6001ap07dl8dxmjcc', 'Manny Atwal', '2026-07-20 03:34:43.614');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8aev001dp07ditz5kh26', 'Darren Perche', '2026-07-20 03:34:43.639');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8afi001fp07d7vpvnsbv', 'Carrie Fingold', '2026-07-20 03:34:43.662');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8afu001hp07dq0cvh7mw', 'Margaret Proven', '2026-07-20 03:34:43.674');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8afz001ip07ddc5slbww', 'Jeff Versterre', '2026-07-20 03:34:43.679');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8ag4001jp07dmhzurzjb', 'Brigitte Futsey', '2026-07-20 03:34:43.684');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8aha001mp07dpfmtupd2', 'Amy Drooker', '2026-07-20 03:34:43.726');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8ahj001op07d84r16d70', 'Michael Pollard', '2026-07-20 03:34:43.735');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8ahp001pp07dzs00268n', 'Krista Stepa Ammeter', '2026-07-20 03:34:43.741');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8aic001sp07dpzsx3a2c', 'Theuntje Schuit', '2026-07-20 03:34:43.764');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8aih001tp07d93qc2dbt', 'Rosemarie Versterre', '2026-07-20 03:34:43.769');
INSERT INTO public."Passenger" (id, name, "createdAt") VALUES ('cmrso8ain001up07de4jrbch2', 'Scott Versterre', '2026-07-20 03:34:43.775');


--
-- Data for Name: Pilot; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: RegulatorySettings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."RegulatorySettings" (id, "maxFlightDutyHours", "extendedMaxFlightDutyHours", "rolling30DayFlightHoursLimit", "extensionRestPeriodHours", "minRestPeriodHours", "restPeriodWindowDays", "splitDutyMaxExtensionHours", "splitDutyMinRestHours", "currencyTakeoffsRequired", "currencyLandingsRequired", "currencyPeriodMonths", "updatedAt") VALUES ('cmrsmyn6g000grf7d183f429g', 14.00, 15.00, 70.00, 24.00, 36.00, 7, 4.00, 4.00, 5, 5, 6, '2026-07-20 02:59:14.008');


--
-- Data for Name: Trip; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8a5p0000p07d358irxrk', '2026-01-06 00:00:00', 'Winnipeg, MB', 'Palm Springs, CA', 'Winnipeg, MB - Palm Springs, CA', 3.10, 1, 1302, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.31', '2026-07-20 03:34:43.31');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8a7g0006p07d09fblk7l', '2026-01-06 00:00:00', 'Palm Springs, CA', 'Orlando, FL', 'Palm Springs, CA - Orlando, FL', 3.70, 1, 1868, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.372', '2026-07-20 03:34:43.372');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8a7k0007p07d73s59cow', '2026-02-04 00:00:00', 'Orlando, FL', 'Winnipeg, MB', 'Orlando, FL - Winnipeg, MB', 3.50, 1, 1500, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.376', '2026-07-20 03:34:43.376');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8a7o0008p07dxgpg2pwe', '2026-02-18 00:00:00', 'Winnipeg, MB', 'Phoenix, AZ', 'Winnipeg, MB - Phoenix, AZ', 3.00, 1, 1215, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.38', '2026-07-20 03:34:43.38');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8a8w000hp07dtm70qwlq', '2026-02-20 00:00:00', 'Phoenix, AZ', 'Winnipeg, MB', 'Phoenix, AZ - Winnipeg, MB', 2.60, 1, 1215, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.424', '2026-07-20 03:34:43.424');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8a9l000kp07du8hbomk7', '2026-03-19 00:00:00', 'Winnipeg, MB', 'St Paul, MN', 'Winnipeg, MB - St Paul, MN', 0.80, 1, 346, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.449', '2026-07-20 03:34:43.449');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8aa0000np07dlkrtf3al', '2026-03-20 00:00:00', 'St Paul, MN', 'Winnipeg, MB', 'St Paul, MN - Winnipeg, MB', 1.20, 1, 353, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.464', '2026-07-20 03:34:43.464');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8aaa000op07dzylzhlmr', '2026-03-22 00:00:00', 'Winnipeg, MB', 'Tortola, BVI', 'Winnipeg, MB - Tortola, BVI', 5.30, 1, 2557, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.474', '2026-07-20 03:34:43.474');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8aax000sp07dgiwy36dt', '2026-03-30 00:00:00', 'Tortola, BVI', 'Jacksonville, FL', 'Tortola, BVI - Jacksonville, FL', 3.10, 1, 1428, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.497', '2026-07-20 03:34:43.497');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ab7000tp07dfqxrrt0w', '2026-03-30 00:00:00', 'Jacksonville, FL', 'Jacksonville, FL', 'Jacksonville, FL - Jacksonville, FL', 0.30, 1, 54, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.507', '2026-07-20 03:34:43.507');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8abg000up07d3pbypnv4', '2026-03-30 00:00:00', 'Jacksonville, FL', 'Jacksonville, FL', 'Jacksonville, FL - Jacksonville, FL', 0.10, 1, 15, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.516', '2026-07-20 03:34:43.516');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8abq000vp07d8iwtvf2m', '2026-04-02 00:00:00', 'Jacksonville, FL', 'Orlando, FL', 'Jacksonville, FL - Orlando, FL', 0.80, 1, 156, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.526', '2026-07-20 03:34:43.526');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8abt000wp07dmbhp8fhc', '2026-04-04 00:00:00', 'Orlando, FL', 'Winnipeg, MB', 'Orlando, FL - Winnipeg, MB', 3.40, 1, 1553, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.529', '2026-07-20 03:34:43.529');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8abw000xp07dzckoidi1', '2026-04-06 00:00:00', 'Winnipeg, MB', 'Richmond, VA', 'Winnipeg, MB - Richmond, VA', 2.30, 1, 1150, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.533', '2026-07-20 03:34:43.533');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ac1000yp07dp0ywo9oo', '2026-04-07 00:00:00', 'Richmond, VA', 'Raleigh, NC', 'Richmond, VA - Raleigh, NC', 0.50, 1, 143, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.537', '2026-07-20 03:34:43.537');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ac6000zp07dx6movet8', '2026-04-07 00:00:00', 'Raleigh, NC', 'Winnipeg, MB', 'Raleigh, NC - Winnipeg, MB', 3.00, 1, 1302, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.542', '2026-07-20 03:34:43.542');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8acc0010p07d0fwenmk2', '2026-04-16 00:00:00', 'Winnipeg, MB', 'Palm Springs, CA', 'Winnipeg, MB - Palm Springs, CA', 3.10, 1, 1302, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.548', '2026-07-20 03:34:43.548');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8acq0011p07dvn3jqicy', '2026-04-19 00:00:00', 'Palm Springs, CA', 'Winnipeg, MB', 'Palm Springs, CA - Winnipeg, MB', 2.80, 1, 1329, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.562', '2026-07-20 03:34:43.562');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8add0014p07ddm1f8xf6', '2026-04-28 00:00:00', 'Winnipeg, MB', 'Denver, CO', 'Winnipeg, MB - Denver, CO', 1.90, 1, 750, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.585', '2026-07-20 03:34:43.585');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8adm0016p07dkc3vktvl', '2026-04-29 00:00:00', 'Denver, CO', 'St George, UT', 'Denver, CO - St George, UT', 1.20, 1, 454, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.594', '2026-07-20 03:34:43.594');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8adw0018p07d0yus0cq9', '2026-04-29 00:00:00', 'St George, UT', 'Winnipeg, MB', 'St George, UT - Winnipeg, MB', 2.30, 1, 1063, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.604', '2026-07-20 03:34:43.604');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ae00019p07drjjohamx', '2026-06-03 00:00:00', 'Winnipeg, MB', 'Casper, WY', 'Winnipeg, MB - Casper, WY', 1.40, 1, 632, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.608', '2026-07-20 03:34:43.608');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8aec001bp07dkxmotv2f', '2026-06-03 00:00:00', 'Casper, WY', 'Sacramento, CA', 'Casper, WY - Sacramento, CA', 1.70, 1, 772, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.62', '2026-07-20 03:34:43.62');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8aek001cp07drzz8sjwo', '2026-06-04 00:00:00', 'Sacramento, CA', 'Van Nuys, CA', 'Sacramento, CA - Van Nuys, CA', 0.80, 1, 317, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.628', '2026-07-20 03:34:43.628');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8af0001ep07d9duvg4cj', '2026-06-05 00:00:00', 'Van Nuys, CA', 'Winnipeg, MB', 'Van Nuys, CA - Winnipeg, MB', 2.90, 1, 1354, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.644', '2026-07-20 03:34:43.644');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8afn001gp07ddfo5099v', '2026-06-16 00:00:00', 'Winnipeg, MB', 'Lansing, MI', 'Winnipeg, MB - Lansing, MI', 1.50, 1, 671, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.667', '2026-07-20 03:34:43.667');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8agd001kp07d55owsvxl', '2026-06-16 00:00:00', 'Lansing, MI', 'Ypsilanti, MI', 'Lansing, MI - Ypsilanti, MI', 0.30, 1, 66, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.693', '2026-07-20 03:34:43.693');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8agu001lp07dd06g5vvt', '2026-06-16 00:00:00', 'Ypsilanti, MI', 'Winnipeg, MB', 'Ypsilanti, MI - Winnipeg, MB', 2.00, 1, 920, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.71', '2026-07-20 03:34:43.71');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ahe001np07db2m22wfv', '2026-06-21 00:00:00', 'Winnipeg, MB', 'Chicago, IL', 'Winnipeg, MB - Chicago, IL', 1.60, 1, 661, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.73', '2026-07-20 03:34:43.73');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ahv001qp07dyd3yitan', '2026-06-23 00:00:00', 'Chicago, IL', 'Winnipeg, MB', 'Chicago, IL - Winnipeg, MB', 1.70, 1, 724, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.747', '2026-07-20 03:34:43.747');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ai5001rp07drltd0zah', '2026-07-08 00:00:00', 'Winnipeg, MB', 'Churchill, MB', 'Winnipeg, MB - Churchill, MB', 1.30, 1, 561, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.757', '2026-07-20 03:34:43.757');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8ais001vp07d32r5lfyy', '2026-07-09 00:00:00', 'Churchill, MB', 'Winnipeg, MB', 'Churchill, MB - Winnipeg, MB', 1.30, 1, 551, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.78', '2026-07-20 03:34:43.78');
INSERT INTO public."Trip" (id, date, "departureAirport", "arrivalAirport", "routeLabel", hours, cycles, miles, purpose, notes, "pilotId", "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings", "createdAt", "updatedAt") VALUES ('cmrso8aj2001wp07dq5cvdbim', '2026-07-13 00:00:00', 'Winnipeg, MB', 'Wichita, KS', 'Winnipeg, MB - Wichita, KS', 1.60, 1, 718, NULL, 'Imported from Pax Tacking 2026.numbers', NULL, 1, 1, 0, 0, '2026-07-20 03:34:43.79', '2026-07-20 03:34:43.79');


--
-- Data for Name: TripPassenger; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a5p0000p07d358irxrk', 'cmrso8a6e0001p07d9ac5whop');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a5p0000p07d358irxrk', 'cmrso8a6q0002p07d5j8m3e61');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a5p0000p07d358irxrk', 'cmrso8a6x0003p07dr892vpma');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a5p0000p07d358irxrk', 'cmrso8a740004p07dxyyrw4fd');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a5p0000p07d358irxrk', 'cmrso8a7a0005p07dpe3466tl');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a88000cp07dvqgw7gku');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a8c000dp07dgerp51oh');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a8h000ep07dgbxjk6d9');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a8m000fp07d6djjl254');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a7o0008p07dxgpg2pwe', 'cmrso8a8q000gp07d7s91u0jo');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a88000cp07dvqgw7gku');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a8c000dp07dgerp51oh');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a8h000ep07dgbxjk6d9');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a8m000fp07d6djjl254');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a9a000ip07d89h4ldbn');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a8w000hp07dtm70qwlq', 'cmrso8a9f000jp07dag0i387o');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a9l000kp07du8hbomk7', 'cmrso8a9n000lp07d7bmql6yt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a9l000kp07du8hbomk7', 'cmrso8a9s000mp07d8fq5iftr');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a9l000kp07du8hbomk7', 'cmrso8a88000cp07dvqgw7gku');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8a9l000kp07du8hbomk7', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aa0000np07dlkrtf3al', 'cmrso8a9n000lp07d7bmql6yt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aa0000np07dlkrtf3al', 'cmrso8a9s000mp07d8fq5iftr');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aa0000np07dlkrtf3al', 'cmrso8a88000cp07dvqgw7gku');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aa0000np07dlkrtf3al', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aaa000op07dzylzhlmr', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aaa000op07dzylzhlmr', 'cmrso8aak000pp07d268vaeef');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aaa000op07dzylzhlmr', 'cmrso8aap000qp07dxc2u9wr8');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aaa000op07dzylzhlmr', 'cmrso8aat000rp07d5znud2vu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aax000sp07dgiwy36dt', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aax000sp07dgiwy36dt', 'cmrso8aak000pp07d268vaeef');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aax000sp07dgiwy36dt', 'cmrso8aap000qp07dxc2u9wr8');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aax000sp07dgiwy36dt', 'cmrso8aat000rp07d5znud2vu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ab7000tp07dfqxrrt0w', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ab7000tp07dfqxrrt0w', 'cmrso8aak000pp07d268vaeef');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ab7000tp07dfqxrrt0w', 'cmrso8aap000qp07dxc2u9wr8');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ab7000tp07dfqxrrt0w', 'cmrso8aat000rp07d5znud2vu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8abg000up07d3pbypnv4', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8abg000up07d3pbypnv4', 'cmrso8aak000pp07d268vaeef');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8abg000up07d3pbypnv4', 'cmrso8aap000qp07dxc2u9wr8');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8abg000up07d3pbypnv4', 'cmrso8aat000rp07d5znud2vu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8abw000xp07dzckoidi1', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ac1000yp07dp0ywo9oo', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ac6000zp07dx6movet8', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acc0010p07d0fwenmk2', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acc0010p07d0fwenmk2', 'cmrso8a6q0002p07d5j8m3e61');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acc0010p07d0fwenmk2', 'cmrso8a6e0001p07d9ac5whop');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acc0010p07d0fwenmk2', 'cmrso8a7a0005p07dpe3466tl');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acc0010p07d0fwenmk2', 'cmrso8a740004p07dxyyrw4fd');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acq0011p07dvn3jqicy', 'cmrso8act0012p07din07poqp');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acq0011p07dvn3jqicy', 'cmrso8ad00013p07dvzr4k5fx');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acq0011p07dvn3jqicy', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acq0011p07dvn3jqicy', 'cmrso8a6q0002p07d5j8m3e61');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acq0011p07dvn3jqicy', 'cmrso8a6e0001p07d9ac5whop');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acq0011p07dvn3jqicy', 'cmrso8a7a0005p07dpe3466tl');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8acq0011p07dvn3jqicy', 'cmrso8a740004p07dxyyrw4fd');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8add0014p07ddm1f8xf6', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8add0014p07ddm1f8xf6', 'cmrso8adi0015p07drvcfxakr');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8adm0016p07dkc3vktvl', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8adm0016p07dkc3vktvl', 'cmrso8adr0017p07d6iqs9gl1');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8adw0018p07d0yus0cq9', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ae00019p07drjjohamx', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ae00019p07drjjohamx', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ae00019p07drjjohamx', 'cmrso8ae6001ap07dl8dxmjcc');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ae00019p07drjjohamx', 'cmrso8a8h000ep07dgbxjk6d9');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aec001bp07dkxmotv2f', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aec001bp07dkxmotv2f', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aec001bp07dkxmotv2f', 'cmrso8ae6001ap07dl8dxmjcc');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aec001bp07dkxmotv2f', 'cmrso8a8h000ep07dgbxjk6d9');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aek001cp07drzz8sjwo', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aek001cp07drzz8sjwo', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aek001cp07drzz8sjwo', 'cmrso8ae6001ap07dl8dxmjcc');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aek001cp07drzz8sjwo', 'cmrso8a8h000ep07dgbxjk6d9');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8aek001cp07drzz8sjwo', 'cmrso8aev001dp07ditz5kh26');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8a82000bp07djhlh3i5p');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8ae6001ap07dl8dxmjcc');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8a8h000ep07dgbxjk6d9');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8aev001dp07ditz5kh26');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8a9n000lp07d7bmql6yt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8a9s000mp07d8fq5iftr');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8af0001ep07d9duvg4cj', 'cmrso8afi001fp07d7vpvnsbv');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8ae6001ap07dl8dxmjcc');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8afu001hp07dq0cvh7mw');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8afz001ip07ddc5slbww');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8ag4001jp07dmhzurzjb');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8a9n000lp07d7bmql6yt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8afn001gp07ddfo5099v', 'cmrso8a8c000dp07dgerp51oh');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agd001kp07d55owsvxl', 'cmrso8afu001hp07dq0cvh7mw');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agd001kp07d55owsvxl', 'cmrso8afz001ip07ddc5slbww');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agd001kp07d55owsvxl', 'cmrso8ag4001jp07dmhzurzjb');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agd001kp07d55owsvxl', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agd001kp07d55owsvxl', 'cmrso8a9n000lp07d7bmql6yt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agd001kp07d55owsvxl', 'cmrso8a8c000dp07dgerp51oh');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8ae6001ap07dl8dxmjcc');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8afu001hp07dq0cvh7mw');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8ag4001jp07dmhzurzjb');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8a7r0009p07dsgkwzs8h');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8a9n000lp07d7bmql6yt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8a8c000dp07dgerp51oh');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8agu001lp07dd06g5vvt', 'cmrso8aha001mp07dpfmtupd2');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahe001np07db2m22wfv', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahe001np07db2m22wfv', 'cmrso8ahj001op07d84r16d70');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahe001np07db2m22wfv', 'cmrso8ahp001pp07dzs00268n');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahe001np07db2m22wfv', 'cmrso8a8c000dp07dgerp51oh');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahv001qp07dyd3yitan', 'cmrso8a7x000ap07d3av4kpqu');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahv001qp07dyd3yitan', 'cmrso8ahj001op07d84r16d70');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahv001qp07dyd3yitan', 'cmrso8ahp001pp07dzs00268n');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ahv001qp07dyd3yitan', 'cmrso8a8c000dp07dgerp51oh');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ai5001rp07drltd0zah', 'cmrso8afz001ip07ddc5slbww');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ai5001rp07drltd0zah', 'cmrso8aic001sp07dpzsx3a2c');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ai5001rp07drltd0zah', 'cmrso8aih001tp07d93qc2dbt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ai5001rp07drltd0zah', 'cmrso8ain001up07de4jrbch2');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ais001vp07d32r5lfyy', 'cmrso8afz001ip07ddc5slbww');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ais001vp07d32r5lfyy', 'cmrso8aic001sp07dpzsx3a2c');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ais001vp07d32r5lfyy', 'cmrso8aih001tp07d93qc2dbt');
INSERT INTO public."TripPassenger" ("tripId", "passengerId") VALUES ('cmrso8ais001vp07d32r5lfyy', 'cmrso8ain001up07de4jrbch2');


--
-- Name: Aircraft Aircraft_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Aircraft"
    ADD CONSTRAINT "Aircraft_pkey" PRIMARY KEY (id);


--
-- Name: Attachment Attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_pkey" PRIMARY KEY (id);


--
-- Name: CostCategory CostCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CostCategory"
    ADD CONSTRAINT "CostCategory_pkey" PRIMARY KEY (id);


--
-- Name: CostEntry CostEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CostEntry"
    ADD CONSTRAINT "CostEntry_pkey" PRIMARY KEY (id);


--
-- Name: DutyDayLog DutyDayLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DutyDayLog"
    ADD CONSTRAINT "DutyDayLog_pkey" PRIMARY KEY (id);


--
-- Name: Passenger Passenger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Passenger"
    ADD CONSTRAINT "Passenger_pkey" PRIMARY KEY (id);


--
-- Name: Pilot Pilot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Pilot"
    ADD CONSTRAINT "Pilot_pkey" PRIMARY KEY (id);


--
-- Name: RegulatorySettings RegulatorySettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RegulatorySettings"
    ADD CONSTRAINT "RegulatorySettings_pkey" PRIMARY KEY (id);


--
-- Name: TripPassenger TripPassenger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TripPassenger"
    ADD CONSTRAINT "TripPassenger_pkey" PRIMARY KEY ("tripId", "passengerId");


--
-- Name: Trip Trip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Trip"
    ADD CONSTRAINT "Trip_pkey" PRIMARY KEY (id);


--
-- Name: Aircraft_tailNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Aircraft_tailNumber_key" ON public."Aircraft" USING btree ("tailNumber");


--
-- Name: CostCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CostCategory_name_key" ON public."CostCategory" USING btree (name);


--
-- Name: CostEntry_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CostEntry_categoryId_idx" ON public."CostEntry" USING btree ("categoryId");


--
-- Name: CostEntry_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CostEntry_date_idx" ON public."CostEntry" USING btree (date);


--
-- Name: DutyDayLog_pilotId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DutyDayLog_pilotId_date_idx" ON public."DutyDayLog" USING btree ("pilotId", date);


--
-- Name: DutyDayLog_pilotId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DutyDayLog_pilotId_date_key" ON public."DutyDayLog" USING btree ("pilotId", date);


--
-- Name: Passenger_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Passenger_name_key" ON public."Passenger" USING btree (name);


--
-- Name: Pilot_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Pilot_name_key" ON public."Pilot" USING btree (name);


--
-- Name: TripPassenger_passengerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TripPassenger_passengerId_idx" ON public."TripPassenger" USING btree ("passengerId");


--
-- Name: Trip_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Trip_date_idx" ON public."Trip" USING btree (date);


--
-- Name: Trip_pilotId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Trip_pilotId_idx" ON public."Trip" USING btree ("pilotId");


--
-- Name: Attachment Attachment_costEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_costEntryId_fkey" FOREIGN KEY ("costEntryId") REFERENCES public."CostEntry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attachment Attachment_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public."Trip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CostEntry CostEntry_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CostEntry"
    ADD CONSTRAINT "CostEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."CostCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DutyDayLog DutyDayLog_pilotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DutyDayLog"
    ADD CONSTRAINT "DutyDayLog_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES public."Pilot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TripPassenger TripPassenger_passengerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TripPassenger"
    ADD CONSTRAINT "TripPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES public."Passenger"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TripPassenger TripPassenger_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TripPassenger"
    ADD CONSTRAINT "TripPassenger_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public."Trip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trip Trip_pilotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Trip"
    ADD CONSTRAINT "Trip_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES public."Pilot"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


