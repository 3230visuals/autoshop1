-- =============================================
-- RPC functions for draft ticket operations
-- These bypass PostgREST's column cache entirely
-- =============================================

-- 1. Create a draft ticket and return its ID + token
CREATE OR REPLACE FUNCTION create_draft_ticket(
    p_shop_id TEXT,
    p_client_id TEXT,
    p_token TEXT
) RETURNS JSON AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.jobs (
        shop_id, client_id, client_name, vehicle_name,
        status, priority, bay, staff_id,
        progress, stage_index, services, financials,
        notes, is_draft, public_token
    ) VALUES (
        p_shop_id, p_client_id, 'Pending', 'Pending',
        'Checked In', 'medium', 'TBD', 'u3',
        0, 0, '[]'::jsonb, '{"subtotal":0,"tax":0,"total":0}'::jsonb,
        'Draft — setup in progress', true, p_token
    ) RETURNING id INTO v_id;

    RETURN json_build_object('id', v_id, 'token', p_token);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get a ticket by its public token
CREATE OR REPLACE FUNCTION get_ticket_by_token(p_token TEXT)
RETURNS JSON AS $$
DECLARE
    v_row RECORD;
BEGIN
    SELECT * INTO v_row FROM public.jobs WHERE public_token = p_token LIMIT 1;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    RETURN row_to_json(v_row);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get a ticket by its ID
CREATE OR REPLACE FUNCTION get_ticket_by_id(p_id TEXT)
RETURNS JSON AS $$
DECLARE
    v_row RECORD;
BEGIN
    SELECT * INTO v_row FROM public.jobs WHERE id::text = p_id LIMIT 1;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    RETURN row_to_json(v_row);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Finalize a draft ticket (set is_draft=false, update client/vehicle details)
CREATE OR REPLACE FUNCTION finalize_draft_ticket(
    p_ticket_id TEXT,
    p_client_name TEXT,
    p_client_id TEXT,
    p_vehicle TEXT,
    p_vehicle_image TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT 'Initial Onboarding / Check-in'
) RETURNS JSON AS $$
BEGIN
    UPDATE public.jobs SET
        is_draft = false,
        client_name = p_client_name,
        client_id = p_client_id,
        vehicle_name = p_vehicle,
        vehicle_image = p_vehicle_image,
        notes = p_notes,
        status = 'Checked In'
    WHERE id::text = p_ticket_id;

    RETURN json_build_object('success', true, 'id', p_ticket_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permissions to anon role
GRANT EXECUTE ON FUNCTION create_draft_ticket(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_ticket_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_ticket_by_id(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION finalize_draft_ticket(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
