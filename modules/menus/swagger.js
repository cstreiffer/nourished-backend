/**
 * @swagger
 *  components:
 *    schemas:
 *      Menu:
 *        type: object
 *        required:
 *          - id
 *          - userId
 *          - timeslotId
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the menu.
 *          mealName:
 *            type: string
 *            description: Name of the dish.
 *          mealDescription:
 *            type: string
 *            description: Description of the dish
 *          allergens:
 *            type: array
 *            items:
 *              type: string
 *            description: Any allergens in food - milk/dairy, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soy
 *          dietaryRestrictions:
 *            type: array
 *            items:
 *              type: string
 *            description: Type of food - Vegan, Vegetarian, Gluten-Free
 *          imageURL:
 *            type: string
 *            description: Image URL of the uploaded meal image. 
 *          price:
 *            type: decimal
 *            description: Price of the meal.
 *          mealinfoId:
 *            type: string
 *            description: ID of the menu the meal is attached to. Menu contains the timeslot information. 
 *          userId:
 *            type: string
 *            description: UUID of the user who created the meal. Should not be returned.  
 *          timeslotId:
 *            type: string
 *            description: UUID of the timeslot for the meal
 *          finalized:
 *            type: boolean
 *            description: Whether the menu can be further deleted
 *          visible:
 *            type: boolean
 *            description: Whether the menu is shown to the user
 *      TimeSlot:
 *        type: object
 *        required:
 *          - id
 *          - date
 *          - restaurantId
 *          - userId
 *          - hospitalId
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
 *          hospitalId:
 *            type: string
 *            description: UUID of hospital location. 
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
 *                - menus
 *                - finalized
 *              properties:
 *                menus:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required:
 *                      - mealId
 *                      - timeslotId
 *                    properties:
 *                      mealId:
 *                        type: string
 *                      timeslotId:
 *                        type: string
 *                finalized:
 *                  type: boolean
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
 *      summary: Updates the menu. Visibility can be changed.
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
 *                visible:
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
 *  /rest/timeslots/:
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
 *  /timeslots/:
 *    get:
 *      summary: Get all menu timeslots 
 *      tags: [Menus]
 *      responses:
 *        "200":
 *          description: Get menu timeslots
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TimeSlot'
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
 *                - restaurantName
 *                - hospitalName
 *                - date
 *              properties:
 *                restaurantName:
 *                  type: string
 *                hospitalName:
 *                  type: string
 *                date:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Create timeslot
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TimeSlot'
 *  /timeslots/{timeslotId}:
 *    delete:
 *      summary: Will delete the timeslot
 *      tags: [Menus]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: timeslotId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the timeslot
 *      responses:
 *        "200":
 *          description: Deletes a timeslot
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TimeSlot'
 *  /timeslots/index:
 *    get:
 *      summary: Get all menu timeslots index
 *      tags: [Menus]
 *      responses:
 *        "200":
 *          description: Get menu timeslots index
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TimeSlot'
 */
