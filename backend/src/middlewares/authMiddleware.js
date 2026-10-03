const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
	// Read the token from an Authorization: Bearer <token> header.
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.startsWith('Bearer ')
		? authHeader.slice(7).trim()
		: null;

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, token missing or invalid.' });
	}

	let decodedUser;

	try {
		// Verify the token with the same secret used when signing it.
		decodedUser = jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return res.status(401).json({ message: 'Not authorized, token missing or invalid.' });
	}

	// Make the decoded token payload available to the next handler.
	req.user = decodedUser;
	return next();
};

module.exports = authMiddleware;
