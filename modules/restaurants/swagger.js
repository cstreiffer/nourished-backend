/**
 * @swagger
 *  components:
 *    schemas:
 *      Restaurant:
 *        type: object
 *        required:
 *          - id
 *          - name
 *          - phoneNumber
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the restaurant.
 *          name:
 *            type: string
 *            description: Name of the restaurant.
 *          phoneNumber:
 *            type: string
 *            description: Phone number for contact at hosital.
 *          userId:
 *            type: string
 *            description: UUID of user who created hospital.
 *          email:
 *            type: string
 *            description: Email address for contact at hosital.
 *          streetAddress:
 *            type: string
 *          zip:
 *            type: string
 *          city:
 *            type: string
 *          state:
 *            type: string
 * tags:
 *   name: Users
 *   description: User management
 * path:
 *  /restaurants/:
 *    get:
 *      summary: Get all restaurants
 *      tags: [Restaurants]
 *      responses:
 *        "200":
 *          description: Get restaurants
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 *  /restaurants/{restaurantId}:
 *    get:
 *      summary: Get a user by id
 *      tags: [Restaurants]
 *      parameters:
 *        - in: path
 *          name: restaurantId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the restaurant
 *      responses:
 *        "200":
 *          description: Get restaurant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 */
