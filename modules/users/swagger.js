/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the user.
 *          email:
 *            type: string
 *            description: Email address of the user.
 *          phoneNumber:
 *            type: string
 *            description: Phone number of the user.
 *          roles:
 *            type: string
 *            description: Role for the user. Options are USER or RESTAURANT.
 *          fullName:
 *            type: string
 *          hospitalId:
 *            type: string
 *            description: Hospital user can attach to their profile.
 *    securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 *        bearerFormat: JWT 
 * schemes:
 *   - http
 *   - https
 * path:
 *  /auth/signup:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - id
 *              properties:
 *                id:
 *                  type: string
 *                email:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                account_type:
 *                  type: string
 *                fullName:
 *                  type: string
 *                hospitalId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /auth/signin:
 *    post:
 *      summary: Signs a user in
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - id
 *              properties:
 *                id:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /auth/signin/{token}:
 *    post:
 *      summary: Signs a user in using a token
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: Magic link token 
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /user/me:
 *    get:
 *      summary: Gets user profile
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /user:
 *    get:
 *      summary: Gets user profile
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *    put:
 *      summary: Updates user profile
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                fullName:
 *                  type: string
 *                hospitalId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /users:
 *    get:
 *      summary: Gets all user profiles. Only available in dev.
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 */