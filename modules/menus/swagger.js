/**
 * @swagger
 *  components:
 *    schemas:
 *      Menu:
 *        type: object
 *        required:
 *          - id
 *          - name
 *          - phoneNumber
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the menu.
 *          date:
 *            type: string
 *            description: Time slot for the menu.
 *          userId:
 *            type: boolean
 *            description: ID of the user who created the meal. Should not be returned.  
 *          restaurantId:
 *            type: boolean
 *            description: ID of the restaurant the meal is attached to
 * tags:
 *   name: Menus
 *   description: Menu management
 * path:
 *  /menus/:
 *    get:
 *      summary: Get all menus
 *      tags: [Menus]
 *      responses:
 *        "200":
 *          description: Get menus
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Menu'
 *  /rest/menus/:
 *    post:
 *      summary: Creates a menu attached to the user
 *      tags: [Menus]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - date
 *                - restaurantId
 *              properties:
 *                date:
 *                  type: string
 *                restaurantId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Get menu
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Menu'
 *    get:
 *      summary: Creates a menu attached to the user
 *      tags: [Menus]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "200":
 *          description: Get menu
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Menu'
 *  /rest/menus/{menuId}:
 *    get:
 *      summary: Get a menu by id
 *      tags: [Menus]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: menuId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the menu
 *      responses:
 *        "200":
 *          description: Get menu
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Menu'
 *    put:
 *      summary: Updates a menu attached to user by id. Might not 
 *      tags: [Menus]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: menuId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the menu
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                date:
 *                  type: string
 *                restaurantId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Updates a restaurant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Restaurant'
 */
