const express = require("express");

const {
createBusiness,
getMyBusinesses,
getBusiness,
} = require("../controllers/organizationController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// =====================================
// ORGANIZATION / BUSINESS ROUTES
// =====================================

// Create a new business
router.post("/", protect, createBusiness);

// Get all businesses of logged-in user
router.get("/", protect, getMyBusinesses);

// Tenant security test route
router.get(
"/:organizationId/context",
protect,
(req, res, next) => {
req.headers["x-organization-id"] =
req.params.organizationId;

```
next();
```

},
tenantMiddleware,
(req, res) => {
res.status(200).json({
success: true,
message: "Tenant access granted",
data: {
userId: req.user._id,
organization: req.organization,
membership: {
role: req.organizationRole,
status: req.membership.status,
},
},
});
}
);

// Get a single business
router.get("/:organizationId", protect, getBusiness);

module.exports = router;
