import io
import base64
from firebase_functions import https_fn
from firebase_admin import initialize_app
from PIL import Image

initialize_app()

@https_fn.on_call(
    memory=1024,
    timeout_sec=300,
    region="us-central1",
)
def remove_background(req: https_fn.CallableRequest) -> dict:
    """Remove background from an image.
    
    Expects: { "image": "<base64 encoded image>" }
    Returns: { "image": "<base64 encoded PNG with transparent background>" }
    """
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="Authentication required.",
        )

    image_b64 = req.data.get("image")
    if not image_b64:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Missing 'image' field.",
        )

    try:
        # Lazy import to avoid timeout during deployment analysis
        from rembg import remove

        # Decode input
        image_bytes = base64.b64decode(image_b64)
        input_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

        # Resize if too large (max 1024px on longest side) to keep processing fast
        max_dim = 1024
        w, h = input_image.size
        if max(w, h) > max_dim:
            scale = max_dim / max(w, h)
            input_image = input_image.resize(
                (int(w * scale), int(h * scale)), Image.LANCZOS
            )

        # Remove background
        output_image = remove(input_image)

        # Encode output as PNG (preserves transparency)
        buf = io.BytesIO()
        output_image.save(buf, format="PNG", optimize=True)
        result_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        return {"image": result_b64}

    except Exception as e:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Background removal failed: {str(e)}",
        )
