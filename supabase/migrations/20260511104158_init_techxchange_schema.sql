--
-- PostgreSQL database dump
--


-- Dumped from database version 16.11 (Homebrew)
-- Dumped by pg_dump version 16.11 (Homebrew)

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
-- Name: admin_review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admin_review_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_admin_reviews_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_reviews_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_brand_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_brand_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_catalog_spec_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_catalog_spec_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_orders_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_payment_method AS ENUM (
    'credit_card',
    'paypal',
    'bank_transfer',
    'cod'
);


--
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'pending',
    'completed',
    'canceled'
);


--
-- Name: enum_payments_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_payments_payment_method AS ENUM (
    'credit_card',
    'paypal',
    'bank_transfer',
    'cod'
);


--
-- Name: enum_payments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_payments_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


--
-- Name: enum_product_catalog_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_product_catalog_status AS ENUM (
    'draft',
    'pending',
    'active',
    'inactive',
    'rejected',
    'sold_out',
    'deleted'
);


--
-- Name: enum_product_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_product_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_products_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_status AS ENUM (
    'draft',
    'pending',
    'active',
    'inactive',
    'rejected',
    'sold_out',
    'deleted'
);


--
-- Name: enum_reports_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reports_status AS ENUM (
    'pending',
    'resolved',
    'rejected'
);


--
-- Name: enum_sepay_webhook_events_process_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_sepay_webhook_events_process_status AS ENUM (
    'processed',
    'ignored',
    'failed'
);


--
-- Name: enum_sepay_webhook_events_transfer_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_sepay_webhook_events_transfer_type AS ENUM (
    'in',
    'out'
);


--
-- Name: enum_shipments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shipments_status AS ENUM (
    'pending',
    'shipped',
    'delivered',
    'failed'
);


--
-- Name: enum_shop_inventory_ledger_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shop_inventory_ledger_type AS ENUM (
    'import',
    'export'
);


--
-- Name: enum_store_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_store_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_user_passed_item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_user_passed_item_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'completed'
);


--
-- Name: enum_user_product_events_event_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_user_product_events_event_type AS ENUM (
    'impression',
    'view',
    'click',
    'add_to_cart',
    'purchase',
    'wishlist'
);


--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'user',
    'shop',
    'admin'
);


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'credit_card',
    'paypal',
    'bank_transfer',
    'cod'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


--
-- Name: product_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_status AS ENUM (
    'draft',
    'pending',
    'active',
    'inactive',
    'rejected',
    'sold_out',
    'deleted'
);


--
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'pending',
    'resolved',
    'rejected'
);


--
-- Name: shipment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.shipment_status AS ENUM (
    'pending',
    'shipped',
    'delivered',
    'failed'
);


--
-- Name: user_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_gender AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: user_pass_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_pass_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'completed'
);


--
-- Name: user_product_event_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_product_event_type AS ENUM (
    'impression',
    'view',
    'click',
    'add_to_cart',
    'purchase',
    'wishlist'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin',
    'shop'
);


--
-- Name: validate_shop_inventory_ledger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_shop_inventory_ledger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_product_store_id BIGINT;
  v_serial_product_id BIGINT;
  v_inventory_product_id BIGINT;
  v_inventory_serial_id BIGINT;
BEGIN
  SELECT p.store_id
    INTO v_product_store_id
  FROM public.products p
  WHERE p.id = NEW.product_id;

  IF v_product_store_id IS NULL THEN
    RAISE EXCEPTION 'product_id % không tồn tại', NEW.product_id;
  END IF;

  IF v_product_store_id <> NEW.store_id THEN
    RAISE EXCEPTION 'product_id % không thuộc store_id %', NEW.product_id, NEW.store_id;
  END IF;

  SELECT s.product_id
    INTO v_serial_product_id
  FROM public.product_serials s
  WHERE s.id = NEW.serial_id;

  IF v_serial_product_id IS NULL THEN
    RAISE EXCEPTION 'serial_id % không tồn tại', NEW.serial_id;
  END IF;

  IF v_serial_product_id <> NEW.product_id THEN
    RAISE EXCEPTION 'serial_id % không thuộc product_id %', NEW.serial_id, NEW.product_id;
  END IF;

  SELECT i.product_id, i.serial_id
    INTO v_inventory_product_id, v_inventory_serial_id
  FROM public.product_inventory i
  WHERE i.id = NEW.inventory_id;

  IF v_inventory_product_id IS NULL THEN
    RAISE EXCEPTION 'inventory_id % không tồn tại', NEW.inventory_id;
  END IF;

  IF v_inventory_product_id <> NEW.product_id OR v_inventory_serial_id <> NEW.serial_id THEN
    RAISE EXCEPTION 'inventory_id % không khớp với (product_id %, serial_id %)',
      NEW.inventory_id, NEW.product_id, NEW.serial_id;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_reviews (
    id bigint NOT NULL,
    admin_id bigint NOT NULL,
    product_id bigint NOT NULL,
    status public.admin_review_status DEFAULT 'pending'::public.admin_review_status,
    review_comment text,
    reviewed_at timestamp with time zone
);


--
-- Name: admin_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_reviews_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_reviews_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_reviews_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_reviews_id_seq1 OWNED BY public.admin_reviews.id;


--
-- Name: assistant_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_conversations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: assistant_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_conversations_id_seq OWNED BY public.assistant_conversations.id;


--
-- Name: assistant_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    citations_json json NOT NULL,
    confidence double precision,
    usage_json json,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: assistant_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_messages_id_seq OWNED BY public.assistant_messages.id;


--
-- Name: banner_detail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banner_detail (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    banner_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: banner_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banner_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banner_detail_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banner_detail_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banner_detail_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banner_detail_id_seq1 OWNED BY public.banner_detail.id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id bigint NOT NULL,
    name character varying,
    image text,
    status integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banners_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banners_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banners_id_seq1 OWNED BY public.banners.id;


--
-- Name: brand; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand (
    id bigint NOT NULL,
    name character varying,
    image text
);


--
-- Name: brand_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brand_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brand_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brand_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brand_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brand_id_seq1 OWNED BY public.brand.id;


--
-- Name: brand_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_requests (
    id bigint NOT NULL,
    requester_id bigint NOT NULL,
    admin_id bigint,
    brand_id bigint,
    name character varying(255) NOT NULL,
    image text,
    status public.enum_brand_requests_status DEFAULT 'pending'::public.enum_brand_requests_status,
    admin_note text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: brand_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brand_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brand_requests_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brand_requests_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brand_requests_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brand_requests_id_seq1 OWNED BY public.brand_requests.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer,
    added_at timestamp with time zone DEFAULT now()
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq1 OWNED BY public.cart_items.id;


--
-- Name: catalog_spec_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalog_spec_requests (
    id bigint NOT NULL,
    requester_id bigint NOT NULL,
    admin_id bigint,
    catalog_id bigint NOT NULL,
    spec_key character varying(100) NOT NULL,
    proposed_values jsonb DEFAULT '[]'::jsonb NOT NULL,
    status public.enum_catalog_spec_requests_status DEFAULT 'pending'::public.enum_catalog_spec_requests_status NOT NULL,
    admin_note text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: catalog_spec_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.catalog_spec_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: catalog_spec_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.catalog_spec_requests_id_seq OWNED BY public.catalog_spec_requests.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    sender_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    sent_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq1 OWNED BY public.messages.id;


--
-- Name: news_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer,
    price numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    serial_id bigint
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq1 OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    total_price numeric(10,2),
    status public.order_status DEFAULT 'pending'::public.order_status,
    created_at timestamp with time zone DEFAULT now(),
    note text,
    store_id bigint,
    payment_method public.payment_method DEFAULT 'cod'::public.payment_method NOT NULL,
    shipping_address jsonb,
    currency character varying(3) DEFAULT 'VND'::character varying NOT NULL
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq1 OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    transaction_id character varying(100),
    amount numeric(10,2),
    payment_method public.payment_method,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    created_at timestamp with time zone DEFAULT now(),
    currency character varying(3) DEFAULT 'VND'::character varying NOT NULL
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq1 OWNED BY public.payments.id;


--
-- Name: product_attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_catalog (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    brand_id bigint,
    category_id bigint,
    description text,
    specs jsonb,
    default_image text,
    msrp numeric(10,2),
    status public.product_status DEFAULT 'pending'::public.product_status NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_catalog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_catalog_id_seq OWNED BY public.product_catalog.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    id bigint NOT NULL,
    name character varying(100),
    slug character varying(120),
    parent_id bigint,
    level integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_categories_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_categories_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_categories_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_categories_id_seq1 OWNED BY public.product_categories.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    url text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq1 OWNED BY public.product_images.id;


--
-- Name: product_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_inventory (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    serial_id bigint NOT NULL,
    on_hand integer DEFAULT 0 NOT NULL,
    reserved integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ck_product_inventory_non_negative CHECK (((on_hand >= 0) AND (reserved >= 0)))
);


--
-- Name: product_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_inventory_id_seq OWNED BY public.product_inventory.id;


--
-- Name: product_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_requests (
    id bigint NOT NULL,
    requester_id bigint NOT NULL,
    admin_id bigint,
    catalog_id bigint,
    category_id bigint NOT NULL,
    brand_id bigint,
    brand_name character varying(255),
    name character varying(255) NOT NULL,
    description text,
    specs jsonb,
    default_image text,
    status public.enum_product_requests_status DEFAULT 'pending'::public.enum_product_requests_status,
    admin_note text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_requests_id_seq OWNED BY public.product_requests.id;


--
-- Name: product_serials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_serials (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    serial_code character varying(64) NOT NULL,
    serial_specs jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_serials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_serials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_serials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_serials_id_seq OWNED BY public.product_serials.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    seller_id bigint NOT NULL,
    store_id bigint NOT NULL,
    brand_id bigint,
    name character varying(100),
    description text,
    price numeric(10,2),
    quality character varying(20),
    condition_percent integer,
    rating double precision,
    buyturn integer,
    quantity integer,
    status public.product_status DEFAULT 'pending'::public.product_status NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    catalog_id bigint
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq1 OWNED BY public.products.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_revoked boolean DEFAULT false,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq1 OWNED BY public.refresh_tokens.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id bigint NOT NULL,
    reporter_id bigint NOT NULL,
    reported_user_id bigint,
    reported_product_id bigint,
    reported_store_id bigint,
    reason text,
    status public.report_status DEFAULT 'pending'::public.report_status,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_id_seq1 OWNED BY public.reports.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    reviewer_id bigint NOT NULL,
    product_id bigint,
    store_id bigint,
    rating numeric(2,1),
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    images text,
    CONSTRAINT ck_reviews_target_exactly_one CHECK ((((product_id IS NOT NULL) AND (store_id IS NULL)) OR ((product_id IS NULL) AND (store_id IS NOT NULL))))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq1 OWNED BY public.reviews.id;


--
-- Name: sepay_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sepay_webhook_events (
    id bigint NOT NULL,
    sepay_id bigint NOT NULL,
    order_id bigint,
    gateway character varying(100),
    transaction_date timestamp with time zone,
    account_number character varying(100),
    code character varying(255),
    content text,
    transfer_type public.enum_sepay_webhook_events_transfer_type NOT NULL,
    transfer_amount numeric(18,2),
    accumulated numeric(18,2),
    sub_account character varying(255),
    reference_code character varying(255),
    description text,
    raw_payload jsonb NOT NULL,
    process_status public.enum_sepay_webhook_events_process_status DEFAULT 'ignored'::public.enum_sepay_webhook_events_process_status NOT NULL,
    process_message text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sepay_webhook_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sepay_webhook_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sepay_webhook_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sepay_webhook_events_id_seq OWNED BY public.sepay_webhook_events.id;


--
-- Name: shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipments (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    estimated_delivery timestamp with time zone,
    actual_delivery timestamp with time zone,
    status public.shipment_status DEFAULT 'pending'::public.shipment_status,
    created_at timestamp with time zone DEFAULT now(),
    shipping_provider character varying(30),
    shipping_service_id integer,
    shipping_service_type_id integer,
    shipping_fee numeric(10,2),
    ghn_order_code character varying(64),
    ghn_status character varying(64),
    ghn_last_sync_at timestamp without time zone,
    ghn_payload text
);


--
-- Name: shipments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipments_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipments_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipments_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipments_id_seq1 OWNED BY public.shipments.id;


--
-- Name: shop_inventory_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_inventory_ledger (
    id bigint NOT NULL,
    store_id bigint NOT NULL,
    product_id bigint NOT NULL,
    serial_id bigint NOT NULL,
    inventory_id bigint NOT NULL,
    type public.enum_shop_inventory_ledger_type NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(12,2),
    note text,
    reference_type character varying(50),
    reference_id bigint,
    created_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_shop_inventory_ledger_import_cost CHECK (((type <> 'import'::public.enum_shop_inventory_ledger_type) OR (unit_cost IS NOT NULL))),
    CONSTRAINT shop_inventory_ledger_quantity_check CHECK ((quantity > 0))
);


--
-- Name: shop_inventory_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_inventory_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_inventory_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_inventory_ledger_id_seq OWNED BY public.shop_inventory_ledger.id;


--
-- Name: store_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_requests (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    store_id bigint,
    store_name character varying(100) NOT NULL,
    store_description text,
    status public.enum_store_requests_status DEFAULT 'pending'::public.enum_store_requests_status NOT NULL,
    admin_id bigint,
    admin_note text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    contact_phone character varying(32),
    address_line text,
    ward character varying(120),
    district character varying(120),
    city character varying(120),
    province character varying(120),
    ghn_province_id integer,
    ghn_district_id integer,
    ghn_ward_code character varying(20)
);


--
-- Name: store_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.store_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: store_requests_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.store_requests_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: store_requests_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.store_requests_id_seq1 OWNED BY public.store_requests.id;


--
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    id bigint NOT NULL,
    owner_id bigint NOT NULL,
    name character varying(100),
    description text,
    rating double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    address_line text,
    ward character varying(120),
    district character varying(120),
    city character varying(120),
    province character varying(120),
    ghn_province_id integer,
    ghn_district_id integer,
    ghn_ward_code character varying(20),
    ghn_shop_id integer,
    logo text,
    banner text
);


--
-- Name: stores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stores_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stores_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stores_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stores_id_seq1 OWNED BY public.stores.id;


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    full_name character varying(120),
    phone character varying(32),
    address_line text NOT NULL,
    ward character varying(120),
    district character varying(120),
    city character varying(120),
    province character varying(120) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ghn_province_id integer,
    ghn_district_id integer,
    ghn_ward_code character varying(20)
);


--
-- Name: user_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_addresses_id_seq OWNED BY public.user_addresses.id;


--
-- Name: user_passed_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_passed_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_product_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_product_events (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    event_type public.user_product_event_type,
    session_id character varying,
    created_at timestamp with time zone DEFAULT now(),
    meta jsonb
);


--
-- Name: user_product_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_product_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_product_events_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_product_events_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_product_events_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_product_events_id_seq1 OWNED BY public.user_product_events.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying,
    email character varying(100),
    gender public.user_gender,
    phone character varying,
    password_hash character varying,
    role public.user_role,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    avatar text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq1 OWNED BY public.users.id;


--
-- Name: admin_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_reviews ALTER COLUMN id SET DEFAULT nextval('public.admin_reviews_id_seq1'::regclass);


--
-- Name: assistant_conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_conversations ALTER COLUMN id SET DEFAULT nextval('public.assistant_conversations_id_seq'::regclass);


--
-- Name: assistant_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_messages ALTER COLUMN id SET DEFAULT nextval('public.assistant_messages_id_seq'::regclass);


--
-- Name: banner_detail id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner_detail ALTER COLUMN id SET DEFAULT nextval('public.banner_detail_id_seq1'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq1'::regclass);


--
-- Name: brand id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand ALTER COLUMN id SET DEFAULT nextval('public.brand_id_seq1'::regclass);


--
-- Name: brand_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_requests ALTER COLUMN id SET DEFAULT nextval('public.brand_requests_id_seq1'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq1'::regclass);


--
-- Name: catalog_spec_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_spec_requests ALTER COLUMN id SET DEFAULT nextval('public.catalog_spec_requests_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq1'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq1'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq1'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq1'::regclass);


--
-- Name: product_catalog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_catalog ALTER COLUMN id SET DEFAULT nextval('public.product_catalog_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq1'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq1'::regclass);


--
-- Name: product_inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory ALTER COLUMN id SET DEFAULT nextval('public.product_inventory_id_seq'::regclass);


--
-- Name: product_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_requests ALTER COLUMN id SET DEFAULT nextval('public.product_requests_id_seq'::regclass);


--
-- Name: product_serials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serials ALTER COLUMN id SET DEFAULT nextval('public.product_serials_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq1'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq1'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq1'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq1'::regclass);


--
-- Name: sepay_webhook_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sepay_webhook_events ALTER COLUMN id SET DEFAULT nextval('public.sepay_webhook_events_id_seq'::regclass);


--
-- Name: shipments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments ALTER COLUMN id SET DEFAULT nextval('public.shipments_id_seq1'::regclass);


--
-- Name: shop_inventory_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_inventory_ledger ALTER COLUMN id SET DEFAULT nextval('public.shop_inventory_ledger_id_seq'::regclass);


--
-- Name: store_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_requests ALTER COLUMN id SET DEFAULT nextval('public.store_requests_id_seq1'::regclass);


--
-- Name: stores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores ALTER COLUMN id SET DEFAULT nextval('public.stores_id_seq1'::regclass);


--
-- Name: user_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses ALTER COLUMN id SET DEFAULT nextval('public.user_addresses_id_seq'::regclass);


--
-- Name: user_product_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_product_events ALTER COLUMN id SET DEFAULT nextval('public.user_product_events_id_seq1'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq1'::regclass);


--
-- Name: admin_reviews admin_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_reviews
    ADD CONSTRAINT admin_reviews_pkey PRIMARY KEY (id);


--
-- Name: assistant_conversations assistant_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_conversations
    ADD CONSTRAINT assistant_conversations_pkey PRIMARY KEY (id);


--
-- Name: assistant_messages assistant_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_messages
    ADD CONSTRAINT assistant_messages_pkey PRIMARY KEY (id);


--
-- Name: banner_detail banner_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner_detail
    ADD CONSTRAINT banner_detail_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: brand brand_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT brand_name_key UNIQUE (name);


--
-- Name: brand brand_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT brand_pkey PRIMARY KEY (id);


--
-- Name: brand_requests brand_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_requests
    ADD CONSTRAINT brand_requests_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: catalog_spec_requests catalog_spec_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_spec_requests
    ADD CONSTRAINT catalog_spec_requests_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: product_catalog product_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_catalog
    ADD CONSTRAINT product_catalog_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_name_key UNIQUE (name);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_inventory product_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory
    ADD CONSTRAINT product_inventory_pkey PRIMARY KEY (id);


--
-- Name: product_requests product_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_requests
    ADD CONSTRAINT product_requests_pkey PRIMARY KEY (id);


--
-- Name: product_serials product_serials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT product_serials_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sepay_webhook_events sepay_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sepay_webhook_events
    ADD CONSTRAINT sepay_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: sepay_webhook_events sepay_webhook_events_sepay_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sepay_webhook_events
    ADD CONSTRAINT sepay_webhook_events_sepay_id_key UNIQUE (sepay_id);


--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- Name: shop_inventory_ledger shop_inventory_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_inventory_ledger
    ADD CONSTRAINT shop_inventory_ledger_pkey PRIMARY KEY (id);


--
-- Name: store_requests store_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_requests
    ADD CONSTRAINT store_requests_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: banner_detail uq_banner_detail_banner_product; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner_detail
    ADD CONSTRAINT uq_banner_detail_banner_product UNIQUE (banner_id, product_id);


--
-- Name: cart_items uq_cart_user_product; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id);


--
-- Name: order_items uq_order_items_order_product; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT uq_order_items_order_product UNIQUE (order_id, product_id);


--
-- Name: product_inventory uq_product_inventory_product_serial; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory
    ADD CONSTRAINT uq_product_inventory_product_serial UNIQUE (product_id, serial_id);


--
-- Name: product_serials uq_product_serials_product_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT uq_product_serials_product_code UNIQUE (product_id, serial_code);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_product_events user_product_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_product_events
    ADD CONSTRAINT user_product_events_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_reviews_admin_reviewedat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_reviews_admin_reviewedat ON public.admin_reviews USING btree (admin_id, reviewed_at);


--
-- Name: idx_admin_reviews_product_reviewedat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_reviews_product_reviewedat ON public.admin_reviews USING btree (product_id, reviewed_at);


--
-- Name: idx_banner_detail_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_banner_detail_product ON public.banner_detail USING btree (product_id);


--
-- Name: idx_brand_requests_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_requests_name ON public.brand_requests USING btree (name);


--
-- Name: idx_brand_requests_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_requests_requester ON public.brand_requests USING btree (requester_id);


--
-- Name: idx_brand_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_requests_status ON public.brand_requests USING btree (status);


--
-- Name: idx_cart_items_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_product ON public.cart_items USING btree (product_id);


--
-- Name: idx_cart_items_user_added; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user_added ON public.cart_items USING btree (user_id, added_at);


--
-- Name: idx_csr_catalog; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_csr_catalog ON public.catalog_spec_requests USING btree (catalog_id);


--
-- Name: idx_csr_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_csr_requester ON public.catalog_spec_requests USING btree (requester_id);


--
-- Name: idx_csr_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_csr_status ON public.catalog_spec_requests USING btree (status);


--
-- Name: idx_messages_receiver_sentat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_receiver_sentat ON public.messages USING btree (receiver_id, sent_at);


--
-- Name: idx_messages_sender_sentat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender_sentat ON public.messages USING btree (sender_id, sent_at);


--
-- Name: idx_order_items_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_product ON public.order_items USING btree (product_id);


--
-- Name: idx_order_items_serial; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_serial ON public.order_items USING btree (serial_id);


--
-- Name: idx_orders_customer_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer_status_created ON public.orders USING btree (customer_id, status, created_at);


--
-- Name: idx_orders_store_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_store_status_created ON public.orders USING btree (store_id, status, created_at);


--
-- Name: idx_payments_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);


--
-- Name: idx_payments_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status_created ON public.payments USING btree (status, created_at);


--
-- Name: idx_product_categories_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_categories_level ON public.product_categories USING btree (level);


--
-- Name: idx_product_categories_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_categories_parent ON public.product_categories USING btree (parent_id);


--
-- Name: idx_product_images_product_sort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_images_product_sort ON public.product_images USING btree (product_id, sort_order);


--
-- Name: idx_product_requests_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_requests_requester ON public.product_requests USING btree (requester_id);


--
-- Name: idx_product_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_requests_status ON public.product_requests USING btree (status);


--
-- Name: idx_product_serials_specs_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_serials_specs_gin ON public.product_serials USING gin (serial_specs);


--
-- Name: idx_products_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_brand ON public.products USING btree (brand_id);


--
-- Name: idx_products_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_created ON public.products USING btree (created_at);


--
-- Name: idx_products_seller; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_seller ON public.products USING btree (seller_id);


--
-- Name: idx_products_status_cat_qty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_status_cat_qty ON public.products USING btree (status, category_id, quantity);


--
-- Name: idx_products_store; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_store ON public.products USING btree (store_id);


--
-- Name: idx_products_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_updated ON public.products USING btree (updated_at);


--
-- Name: idx_reports_reporter_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_reporter_created ON public.reports USING btree (reporter_id, created_at);


--
-- Name: idx_reports_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_status_created ON public.reports USING btree (status, created_at);


--
-- Name: idx_reviews_product_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_product_created ON public.reviews USING btree (product_id, created_at);


--
-- Name: idx_reviews_reviewer_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_reviewer_created ON public.reviews USING btree (reviewer_id, created_at);


--
-- Name: idx_reviews_store_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_store_created ON public.reviews USING btree (store_id, created_at);


--
-- Name: idx_sepay_events_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sepay_events_created ON public.sepay_webhook_events USING btree (created_at);


--
-- Name: idx_sepay_events_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sepay_events_order ON public.sepay_webhook_events USING btree (order_id);


--
-- Name: idx_shipments_ghn_order_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipments_ghn_order_code ON public.shipments USING btree (ghn_order_code);


--
-- Name: idx_shipments_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipments_order ON public.shipments USING btree (order_id);


--
-- Name: idx_shipments_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipments_status_created ON public.shipments USING btree (status, created_at);


--
-- Name: idx_shop_inventory_ledger_inventory_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_inventory_ledger_inventory_created_at ON public.shop_inventory_ledger USING btree (inventory_id, created_at DESC);


--
-- Name: idx_shop_inventory_ledger_product_serial; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_inventory_ledger_product_serial ON public.shop_inventory_ledger USING btree (product_id, serial_id);


--
-- Name: idx_shop_inventory_ledger_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_inventory_ledger_reference ON public.shop_inventory_ledger USING btree (reference_type, reference_id) WHERE (reference_type IS NOT NULL);


--
-- Name: idx_shop_inventory_ledger_store_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_inventory_ledger_store_created_at ON public.shop_inventory_ledger USING btree (store_id, created_at DESC);


--
-- Name: idx_shop_inventory_ledger_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_inventory_ledger_type ON public.shop_inventory_ledger USING btree (type);


--
-- Name: idx_store_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_requests_status ON public.store_requests USING btree (status);


--
-- Name: idx_store_requests_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_requests_user ON public.store_requests USING btree (user_id);


--
-- Name: idx_stores_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stores_owner ON public.stores USING btree (owner_id);


--
-- Name: idx_upe_product_type_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upe_product_type_time ON public.user_product_events USING btree (product_id, event_type, created_at);


--
-- Name: idx_upe_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upe_session ON public.user_product_events USING btree (session_id);


--
-- Name: idx_upe_type_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upe_type_time ON public.user_product_events USING btree (event_type, created_at);


--
-- Name: idx_upe_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upe_user_time ON public.user_product_events USING btree (user_id, created_at);


--
-- Name: idx_user_addresses_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_addresses_user ON public.user_addresses USING btree (user_id);


--
-- Name: idx_user_addresses_user_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_addresses_user_default ON public.user_addresses USING btree (user_id, is_default);


--
-- Name: ix_assistant_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_assistant_conversations_user_id ON public.assistant_conversations USING btree (user_id);


--
-- Name: ix_assistant_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_assistant_messages_conversation_id ON public.assistant_messages USING btree (conversation_id);


--
-- Name: refresh_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: uq_csr_pending_requester_catalog_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_csr_pending_requester_catalog_key ON public.catalog_spec_requests USING btree (requester_id, catalog_id, spec_key, status);


--
-- Name: uq_product_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_product_categories_slug ON public.product_categories USING btree (slug);


--
-- Name: uq_user_addresses_default_per_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_user_addresses_default_per_user ON public.user_addresses USING btree (user_id) WHERE (is_default = true);


--
-- Name: shop_inventory_ledger trg_validate_shop_inventory_ledger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_shop_inventory_ledger BEFORE INSERT OR UPDATE ON public.shop_inventory_ledger FOR EACH ROW EXECUTE FUNCTION public.validate_shop_inventory_ledger();


--
-- Name: admin_reviews admin_reviews_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_reviews
    ADD CONSTRAINT admin_reviews_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: admin_reviews admin_reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_reviews
    ADD CONSTRAINT admin_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: assistant_messages assistant_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_messages
    ADD CONSTRAINT assistant_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.assistant_conversations(id) ON DELETE CASCADE;


--
-- Name: banner_detail banner_detail_banner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner_detail
    ADD CONSTRAINT banner_detail_banner_id_fkey FOREIGN KEY (banner_id) REFERENCES public.banners(id) ON DELETE CASCADE;


--
-- Name: banner_detail banner_detail_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner_detail
    ADD CONSTRAINT banner_detail_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: brand_requests brand_requests_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_requests
    ADD CONSTRAINT brand_requests_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: brand_requests brand_requests_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_requests
    ADD CONSTRAINT brand_requests_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brand(id) ON UPDATE CASCADE;


--
-- Name: brand_requests brand_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_requests
    ADD CONSTRAINT brand_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: catalog_spec_requests catalog_spec_requests_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_spec_requests
    ADD CONSTRAINT catalog_spec_requests_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: catalog_spec_requests catalog_spec_requests_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_spec_requests
    ADD CONSTRAINT catalog_spec_requests_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.product_catalog(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: catalog_spec_requests catalog_spec_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_spec_requests
    ADD CONSTRAINT catalog_spec_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shop_inventory_ledger fk_shop_inventory_ledger_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_inventory_ledger
    ADD CONSTRAINT fk_shop_inventory_ledger_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shop_inventory_ledger fk_shop_inventory_ledger_inventory; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_inventory_ledger
    ADD CONSTRAINT fk_shop_inventory_ledger_inventory FOREIGN KEY (inventory_id) REFERENCES public.product_inventory(id) ON DELETE CASCADE;


--
-- Name: shop_inventory_ledger fk_shop_inventory_ledger_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_inventory_ledger
    ADD CONSTRAINT fk_shop_inventory_ledger_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: shop_inventory_ledger fk_shop_inventory_ledger_serial; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_inventory_ledger
    ADD CONSTRAINT fk_shop_inventory_ledger_serial FOREIGN KEY (serial_id) REFERENCES public.product_serials(id) ON DELETE RESTRICT;


--
-- Name: shop_inventory_ledger fk_shop_inventory_ledger_store; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_inventory_ledger
    ADD CONSTRAINT fk_shop_inventory_ledger_store FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: order_items order_items_serial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_serial_id_fkey FOREIGN KEY (serial_id) REFERENCES public.product_serials(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: product_catalog product_catalog_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_catalog
    ADD CONSTRAINT product_catalog_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brand(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_catalog product_catalog_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_catalog
    ADD CONSTRAINT product_catalog_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_categories product_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_inventory product_inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory
    ADD CONSTRAINT product_inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_inventory product_inventory_serial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory
    ADD CONSTRAINT product_inventory_serial_id_fkey FOREIGN KEY (serial_id) REFERENCES public.product_serials(id) ON DELETE CASCADE;


--
-- Name: product_requests product_requests_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_requests
    ADD CONSTRAINT product_requests_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: product_requests product_requests_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_requests
    ADD CONSTRAINT product_requests_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brand(id);


--
-- Name: product_requests product_requests_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_requests
    ADD CONSTRAINT product_requests_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.product_catalog(id) ON UPDATE CASCADE;


--
-- Name: product_requests product_requests_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_requests
    ADD CONSTRAINT product_requests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id);


--
-- Name: product_requests product_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_requests
    ADD CONSTRAINT product_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_serials product_serials_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT product_serials_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brand(id);


--
-- Name: products products_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.product_catalog(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id);


--
-- Name: products products_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_reported_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_product_id_fkey FOREIGN KEY (reported_product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: reports reports_reported_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_store_id_fkey FOREIGN KEY (reported_store_id) REFERENCES public.stores(id) ON DELETE SET NULL;


--
-- Name: reports reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: sepay_webhook_events sepay_webhook_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sepay_webhook_events
    ADD CONSTRAINT sepay_webhook_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: store_requests store_requests_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_requests
    ADD CONSTRAINT store_requests_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: store_requests store_requests_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_requests
    ADD CONSTRAINT store_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON UPDATE CASCADE;


--
-- Name: store_requests store_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_requests
    ADD CONSTRAINT store_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stores stores_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_product_events user_product_events_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_product_events
    ADD CONSTRAINT user_product_events_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_product_events user_product_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_product_events
    ADD CONSTRAINT user_product_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



-- Enable RLS for Supabase-exposed public tables. Backend connections using the postgres role bypass RLS.
ALTER TABLE public.admin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_spec_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sepay_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_product_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
