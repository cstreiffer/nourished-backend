/**
 * @swagger
 *  components:
 *    schemas:
 *      Cart:
 *        type: object
 *        required:
 *          - id
 *          - mealId
 *          - userId
 *          - quantity
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the cart.
 *          date:
 *            type: string
 *            description: Timestamp when item added to cart.
 *          quantity:
 *            type: integer
 *            description: Quantity of the meal.
 *          mealId:
 *            type: string
 *            description: UUID of the meal.
 *          userId:
 *            type: string
 *            description: UUID of user who's shopping.
 * tags:
 *   name: Carts
 *   description: Cart management
 * path:
 *  /user/carts/:
 *    get:
 *      summary: Get all items in a user's cart
 *      security:
 *        - bearerAuth: []
 *      tags: [Carts]
 *      responses:
 *        "200":
 *          description: Get carts
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Cart'
 *    delete:
 *      summary: Removes all items from cart
 *      tags: [Carts]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "200":
 *          description: Deletes a cart
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Cart'
 *  /user/carts/{cartId}:
 *    get:
 *      summary: Get a cart by id
 *      tags: [Carts]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: cartId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the cart
 *      responses:
 *        "200":
 *          description: Get cart
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Cart'
 *    post:
 *      summary: Creates a cart attached to the user
 *      tags: [Carts]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - quantity
 *                - mealId
 *              properties:
 *                quantity:
 *                  type: integer
 *                mealId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Updates a cart
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Cart'
 *    put:
 *      summary: Updates a cart attached to user by id
 *      tags: [Carts]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: cartId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the cart
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - quantity
 *      responses:
 *        "200":
 *          description: Updates a cart
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Cart'
 *    delete:
 *      summary: Remove item from cart
 *      tags: [Carts]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: cartId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the cart
 *      responses:
 *        "200":
 *          description: Deletes a cart
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Cart'
 */
