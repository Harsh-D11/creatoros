export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      code: "METHOD_NOT_ALLOWED",
      message: "Invalid request method."
    });
  }

  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        code: "MISSING_QUERY",
        message: "Please enter a visual description first."
      });
    }

    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );

    const data = await unsplashRes.json();

    if (!unsplashRes.ok) {
      return res.status(unsplashRes.status).json({
        code: "UNSPLASH_REQUEST_FAILED",
        message: "We couldn’t fetch visual references right now. Please try again.",
        details: data?.errors?.[0] || "Unsplash request failed"
      });
    }

    if (!data?.results?.length) {
      return res.status(404).json({
        code: "NO_IMAGE_FOUND",
        message: "No visual reference found for that prompt."
      });
    }

    return res.status(200).json({
      success: true,
      photo: data.results[0]
    });
  } catch (error) {
    return res.status(500).json({
      code: "UNSPLASH_SERVER_ERROR",
      message: "Something went wrong while fetching visual references. Please try again.",
      details: error.message
    });
  }
}
