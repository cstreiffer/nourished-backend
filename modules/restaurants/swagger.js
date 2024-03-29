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
 *          description:
 *            type: string
 *            description: Description of the restaurant.
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
 *          restaurantStripeAccountId:
 *            type: string
 *            description: Stripe account id.
 *          verified:
 *            type: boolean
 *            description: Whether it's been verified.
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
 *              required:
 *                - name
 *                - phoneNumber
 *              properties:
 *                name:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                description:
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
 *                description:
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
 *          description: Deletes a restaurant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 *  /rest/restaurants/{restaurantId}/export:
 *    get:
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
 *      responses:
 *        "200":
 *          description: Updates a restaurant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 *  /rest/restaurants/{restaurantId}/notify?hospitalId={hospitalId}&deliveryDate={deliveryDate}:
 *    post:
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
 *        - in: path
 *          name: hospitalId
 *          schema:
 *            type: string
 *          required: false
 *          description: Id of the hospital where meal delivered
 *        - in: path
 *          name: deliveryDate
 *          schema:
 *            type: string
 *          required: false
 *          description: Delivery time of the meal
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Updates a restaurant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 */
