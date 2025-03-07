CREATE OR REPLACE FUNCTION delete_old_data(today text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
DELETE FROM device_data
WHERE id IN (
    SELECT id
    FROM device_data
    WHERE to_char(timestamp, 'YYYY-MM-DD') <> today
    ORDER BY timestamp
OFFSET 5
    );
END;
$$;
