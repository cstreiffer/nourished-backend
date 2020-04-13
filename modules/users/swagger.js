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
 */