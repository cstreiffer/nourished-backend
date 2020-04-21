/**
 * @swagger
 *  components:
 *    schemas:
 *      Stripe:
 *        type: object
 *        required:
 *          - id
 *          - groupId
 *          - userId
 *          - paymentIntentId
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the stripe entry.
 *          userId:
 *            type: string
 *            description: UUID of the user.
 *          groupId:
 *            type: string
 *            description: Group UUID for the batch order.
 *          paymentIntentId:
 *            type: string
 *            description: Stripe payment intent identifier. 
 * tags:
 *   name: Stripe
 *   description: Stripe management
 * path:
 *  /stripe/create-payment-intent:
 *    post:
 *      summary: Create a new stripe payment intent
 *      security:
 *        - bearerAuth: []
 *      tags: [Stripe]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - groupId
 *              properties:
 *                groupId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A stripe return
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Stripe'
 *  /stripe/oauth?code={code}:
 *    post:
 *      summary: Create a new stripe payment intent
 *      security:
 *        - bearerAuth: []
 *      tags: [Stripe]
 *      parameters:
 *        - in: path
 *          name: code
 *          schema:
 *            type: string
 *          required: true
 *          description: Stripe code
 *      responses:
 *        "200":
 *          description: A stripe return
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Stripe'
 *  /user/stripe:
 *    get:
 *      summary: Get all stripe payment intents
 *      security:
 *        - bearerAuth: []
 *      tags: [Stripe]
 *      responses:
 *        "200":
 *          description: A stripe return
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Stripe'
 *  /user/stripe/{stripeId}:
 *    get:
 *      summary: Get a stripe payment intent by id
 *      security:
 *        - bearerAuth: []
 *      tags: [Stripe]
 *      parameters:
 *        - in: path
 *          name: stripeId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the stripe payment intent model
 *      responses:
 *        "200":
 *          description: Get stripe payment intent
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Stripe'
 */
