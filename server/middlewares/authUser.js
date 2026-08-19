import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not Authorized',
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (!tokenDecode.id) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized',
            });
        }

        // Keep the authenticated identity separate from client-provided data.
        req.userId = tokenDecode.id;

        // Existing controllers in this project read userId from req.body.
        // Initialize req.body for GET requests, where Express may leave it undefined.
        req.body = req.body || {};
        req.body.userId = req.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

export default authUser;
