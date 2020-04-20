/**
 * @swagger
 *  components:
 *    schemas:
 *      Order:
 *        type: object
 *        required:
 *          - id
 *          - quantity
 *          - menuId
 *          - userId
 *          - groupId
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the order entry.
 *          quantity:
 *            type: string
 *            description: Number of meals included in order entry.
 *          menuId:
 *            type: string
 *            description: UUID of menu.
 *          information:
 *            type: enum
 *            description: Any allergy/dietary information. 
 *          groupId:
 *            type: string
 *            description: UUID of the group/batch order. Generated when order created. 
 *          userId:
 *            type: string
 *            description: UUID of user who's shopping.
 *          userStatus:
 *            type: enum
 *            description: User's status of the order - 'ORDERED', 'NOT_DELIVERED', 'WRONG_DELIVERY', 'COMPLETE', 'ERROR'
 *          restStatus:
 *            type: enum
 *            description: Restaurant's status of the order - 'RECEIVED', 'PROCESSING', 'IN_DELIVERY', 'COMPLETE', 'ERROR'
 *          payStatus:
 *            type: enum
 *            description: Pay status of order - 'PENDING', 'COMPLETE', 'REFUNDED', 'ERROR'
 *          deleted:
 *            type: boolean
 *            description: Marks orders that have been deleted.
 * tags:
 *   name: Orders
 *   description: Order management
 * path:
 *  /user/orders/:
 *    post:
 *      summary: Creates batch order. Cannot create an order within 3 hours of delivery time. Post will fail if >=1 individual orders invalid.
 *      security:
 *        - bearerAuth: []
 *      tags: [Orders]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - orders
 *              properties:
 *                orders:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required:
 *                      - menuId
 *                      - quantity
 *                    properties:
 *                      menuId:
 *                        type: string
 *                      quantity:
 *                        type: integer
 *                      information:
 *                        type: string
 *      responses:
 *        "200":
 *          description: Get orders
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 *    get:
 *      summary: Get all items in a user's order
 *      security:
 *        - bearerAuth: []
 *      tags: [Orders]
 *      responses:
 *        "200":
 *          description: Get orders
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 *    put:
 *      summary: NOT IN SERVICE. Updates batch orders. Cannot update an order within 3 hours of delivery time. Update will fail if >=1 individual orders invalid.
 *      tags: [Orders]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - orders
 *              properties:
 *                orders:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required:
 *                      - orderId
 *                    properties:
 *                      orderId:
 *                        type: string
 *                      information:
 *                        type: string
 *                      quantity:
 *                        type: integer
 *      responses:
 *        "200":
 *          description: Updates a batch order items
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 *    delete:
 *      summary: Deletes a batch of order items. Delete will fail if >=1 individual orders invalid.
 *      tags: [Orders]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - orders
 *                - groupId
 *              properties:
 *                groupId:
 *                  type: string 
 *                orders:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required:
 *                      - orderId
 *                    properties:
 *                      orderId:
 *                        type: string
 *      responses:
 *        "200":
 *          description: Deletes a order
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 *  /user/orders/status:
 *    put:
 *      summary: Updates user status. Applies update to either orderIds or menuIds. 
 *      tags: [Orders]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - userStatus
 *              properties:
 *                userStatus:
 *                  type: string
 *                orderIds:
 *                  type: array
 *                  items:
 *                    type: string
 *                menuIds:
 *                  type: array
 *                  items:
 *                    type: string
 *      responses:
 *        "200":
 *          description: Get order
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 *  /rest/orders/:
 *    get:
 *      summary: Get all items in a user's order
 *      security:
 *        - bearerAuth: []
 *      tags: [Orders]
 *      responses:
 *        "200":
 *          description: Get orders
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 *  /rest/orders/itemized/:
 *    get:
 *      summary: Get all items in a user's order but itemized
 *      security:
 *        - bearerAuth: []
 *      tags: [Orders]
 *      responses:
 *        "200":
 *          description: Get orders
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 *  /rest/orders/status:
 *    put:
 *      summary: Updates restaurant status. Applies update to either orderIds or menuIds. 
 *      tags: [Orders]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - restStatus
 *              properties:
 *                restStatus:
 *                  type: string
 *                orderIds:
 *                  type: array
 *                  items:
 *                    type: string
 *                menuIds:
 *                  type: array
 *                  items:
 *                    type: string
 *      responses:
 *        "200":
 *          description: Get order
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Order'
 */
