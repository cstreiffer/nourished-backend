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
 *   name: Restaurants
 *   description: Restaurant management
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
 *      summary: Get a restaurant by id
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
 *  /rest/restaurants/:
 *    get:
 *      summary: Gets all restaurants attached to user
 *      security:
 *        - bearerAuth: []
 *      tags: [Restaurants]
 *      responses:
 *        "200":
 *          description: A list of restaurant schemas
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 *    post:
 *      summary: Creates a restaurant attached to the user
 *      tags: [Restaurants]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                email:
 *                  type: string
 *                streetAddress:
 *                  type: string
 *                city:
 *                  type: string
 *                state:
 *                  type: string
 *                zip:
 *                  type: string
 *  /rest/restaurants/{restaurantId}:
 *    put:
 *      summary: Updates a restaurant attached to user by id
 *      tags: [Restaurants]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: restaurantId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the restaurant
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                email:
 *                  type: string
 *                streetAddress:
 *                  type: string
 *                city:
 *                  type: string
 *                state:
 *                  type: string
 *                zip:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Updates a restaurant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 *    delete:
 *      summary: Deletes a restaurant attached to user by id
 *      tags: [Restaurants]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: restaurantId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the restaurant
 *      responses:
 *        "200":
 *          description: Updates a restaurant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 */
