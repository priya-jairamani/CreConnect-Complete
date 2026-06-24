/**
 * ──────────────────────────────────────────
 *  CreConnect – JSDoc data-model definitions
 *  (TypeScript-style interfaces as JSDoc)
 *  Replace with actual TS types when the project
 *  migrates to TypeScript.
 * ──────────────────────────────────────────
 */

/**
 * @typedef {'creator' | 'brand' | 'admin'} UserRole
 * @typedef {'pending' | 'approved' | 'rejected' | 'suspended'} UserStatus
 */

/**
 * @typedef {Object} User
 * @property {string}     id
 * @property {string}     email
 * @property {UserRole}   role
 * @property {UserStatus} status
 * @property {string}     createdAt
 * @property {string}     updatedAt
 */

/**
 * @typedef {Object} CreatorProfile
 * @property {string}   userId
 * @property {string}   displayName
 * @property {string}   username
 * @property {string}   bio
 * @property {string}   niche          – e.g. "Fashion", "Tech"
 * @property {number}   followerCount
 * @property {number}   engagementRate – decimal, e.g. 0.034 = 3.4%
 * @property {string}   avatarUrl
 * @property {Platform[]} platforms
 * @property {number}   rating         – 1-5
 * @property {boolean}  isVerified
 */

/**
 * @typedef {Object} Platform
 * @property {'instagram'|'tiktok'|'youtube'|'facebook'} name
 * @property {string}  url
 * @property {boolean} isConnected
 */

/**
 * @typedef {Object} BrandProfile
 * @property {string}  userId
 * @property {string}  companyName
 * @property {string}  contactName
 * @property {string}  industry
 * @property {string}  website
 * @property {string}  logoUrl
 * @property {boolean} isVerified
 */

/**
 * @typedef {'pending'|'accepted'|'rejected'|'completed'} CollabStatus
 *
 * @typedef {Object} Campaign
 * @property {string}       id
 * @property {string}       brandId
 * @property {string}       title
 * @property {string}       description
 * @property {number}       budgetPKR
 * @property {CollabStatus} status
 * @property {string}       createdAt
 * @property {string}       deadline
 */

/**
 * @typedef {Object} Collaboration
 * @property {string}       id
 * @property {string}       campaignId
 * @property {string}       creatorId
 * @property {string}       brandId
 * @property {CollabStatus} status
 * @property {number}       offerAmountPKR
 * @property {string}       offerType      – "Sponsored Post", "Video Review", etc.
 * @property {string}       createdAt
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} conversationId
 * @property {string} senderId
 * @property {string} content
 * @property {string} sentAt
 */

/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} creatorId
 * @property {string} brandId
 * @property {string} lastMessage
 * @property {string} lastMessageAt
 */

/**
 * @typedef {'all'|'creators'|'brands'} NotificationAudience
 *
 * @typedef {Object} Notification
 * @property {string}               id
 * @property {string}               message
 * @property {NotificationAudience} audience
 * @property {'immediate'|'scheduled'} deliveryMode
 * @property {string|null}          scheduledAt
 * @property {'sent'|'failed'|'pending'} status
 * @property {string}               createdAt
 */

/**
 * @typedef {Object} Report
 * @property {string} id
 * @property {string} reporterId
 * @property {string} reportedUserId
 * @property {string} violationType
 * @property {string} description
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null}   user
 * @property {string|null} accessToken
 * @property {string|null} refreshToken
 * @property {boolean}     isAuthenticated
 * @property {boolean}     isLoading
 */
