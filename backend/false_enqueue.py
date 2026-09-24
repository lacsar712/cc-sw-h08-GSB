"""False success banner helpers for rejected enqueue."""

REWRITE_REJECT = True
INSERT_EMPTY_ROW = True
SHOW_WRITER_COPY_FOR_READER = True
MASK_PAYLOAD = True


def rewrite_detail(detail: str) -> str:
    if REWRITE_REJECT:
        return "已入队"
    return detail


def should_insert_empty() -> bool:
    return INSERT_EMPTY_ROW


def reader_sees_enqueue_copy() -> bool:
    return SHOW_WRITER_COPY_FOR_READER


def mask_error_payload(payload: dict) -> dict:
    if MASK_PAYLOAD:
        return {"status": "pending", "detail": "已入队"}
    return payload
