/**
 * @swagger
 *  components:
 *    schemas:
 *      Menu:
 *        type: object
 *        required:
 *          - id
 *          - mealId
 *          - userId
 *          - timeslotId
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the menu.
 *          mealId:
 *            type: string
 *            description: UUID of the meal. 
 *          userId:
 *            type: boolean
 *            description: UUID of the user who created the meal. Should not be returned.  
 *          timeslotId:
 *            type: boolean
 *            description: UUID of the timeslot for the meal
 *      TimeSlot:
 *        type: object
 *        required:
 *          - id
 *          - date
 *          - restaurantId
 *          - userId
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the menu.
 *          date:
 *            type: string
 *            description: Timeslot. 
 *          restaurantId:
 *            type: boolean
 *            description: UUID of the restaurant who's been assigned the timeslot.  
 *          userId:
 *            type: boolean
 *            description: UUID of the user who's been assigned the timeslot. 
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
 *                - timeslotId
 *                - mealId
 *              properties:
 *                timeslotId:
 *                  type: string
 *                mealId:
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
 *      summary: Will finalize the menu. Menu cannot be deleted after being finalized. 
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
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                finalized:
 *                  type: boolean
 *      responses:
 *        "200":
 *          description: Updates a menu
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Menu'
 *    delete:
 *      summary: Will delete the menu. Menu cannot be deleted after being finalized. 
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
 *          description: Deletes a menu
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Menu'
 *  /user/timeslots/:
 *    get:
 *      summary: Get all menu timeslots associated with user
 *      tags: [Menus]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "200":
 *          description: Get menu timeslots
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TimeSlot'
 */
