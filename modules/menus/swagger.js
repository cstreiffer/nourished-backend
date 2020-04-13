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
 *            type: datetime
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
 *  /menus/{menuId}:
 *    get:
 *      summary: Get a menu by id
 *      tags: [Menus]
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
 */
