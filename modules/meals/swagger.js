/**
 * @swagger
 *  components:
 *    schemas:
 *      Meal:
 *        type: object
 *        required:
 *          - id
 *          - name
 *          - mealinfoId 
 *          - restaurantId 
 *          - userId 
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the meal.
 *          name:
 *            type: string
 *            description: Name of the dish.
 *          description:
 *            type: string
 *            description: Description of the dish
 *          allergens:
 *            type: string
 *            description: Any allergens in food - milk/dairy, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soy
 *          dietaryRestrictions:
 *            type: string
 *            description: Type of food - Vegan, Vegetarian, Gluten-Free
 *          imageURL:
 *            type: string
 *            description: Image URL of the uploaded meal image. 
 *          price:
 *            type: decimal
 *            description: Price of the meal.
 *          visible:
 *            type: boolean
 *            description: Optional additional field that can be used for ux.
 *          finalized:
 *            type: boolean
 *            description: Set to FALSE if meal can be updated/deleted. Set to TRUE by default. 
 *          userId:
 *            type: string
 *            description: ID of the user who created the meal. Should not be returned.  
 *          mealinfoId:
 *            type: string
 *            description: ID of the menu the meal is attached to. Menu contains the timeslot information. 
 *          restaurantId:
 *            type: boolean
 *            description: UUID of the restaurant who's been assigned the timeslot.  
 *      MealInfo:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the meal info.
 *          type:
 *            type: string
 *            description: Lunch or dinner. Or more??
 *          price:
 *            type: string
 *            description: Standardized price of the meal type. Typically $5.00
 *          time:
 *            type: string
 *            description: Time meal is picked up. 
 *          notes:
 *            type: string
 *            description: Notes.  
 *          other:
 *            type: string
 *            description: More notes. 
 * tags:
 *   name: Meals
 *   description: Meal management
 * path:
 *  /meals/:
 *    get:
 *      summary: Get all meals (only returns finalized=TRUE meals)
 *      tags: [Meals]
 *      responses:
 *        "200":
 *          description: Get meals
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Meal'
 *  /meals/{mealId}:
 *    get:
 *      summary: Get a user by id
 *      tags: [Meals]
 *      parameters:
 *        - in: path
 *          name: mealId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the meal
 *      responses:
 *        "200":
 *          description: Get meal
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Meal'
 *  /rest/meals/:
 *    get:
 *      summary: Gets all meals attached to user
 *      security:
 *        - bearerAuth: []
 *      tags: [Meals]
 *      responses:
 *        "200":
 *          description: A list of meal schemas
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Meal'
 *    post:
 *      summary: Creates a meal attached to the user
 *      tags: [Meals]
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
 *                - mealinfoId
 *                - restaurantId
 *              properties:
 *                mealinfoId:
 *                  type: string
 *                restaurantId:
 *                  type: string
 *                name:
 *                  type: string
 *                description:
 *                  type: string
 *                allergens:
 *                  type: string
 *                dietaryRestrictions:
 *                  type: string
 *                visible:
 *                  type: boolean
 *                finalized:
 *                  type: boolean
 *      responses:
 *        "200":
 *          description: Creates a meal
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Meal'
 *  /rest/meals/{mealId}:
 *    put:
 *      summary: Updates a meal attached to user by id. Cannot be updated ONCE FINALIZED.
 *      tags: [Meals]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: mealId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the meal
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                description:
 *                  type: string
 *                allergens:
 *                  type: string
 *                dietaryRestrictions:
 *                  type: string
 *                visible:
 *                  type: boolean
 *                finalized:
 *                  type: boolean
 *                mealinfoId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Updates a meal
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Meal'
 *    delete:
 *      summary: Deletes a meal attached to user by id. Can only be deleted IF NOT FINALIZED.
 *      tags: [Meals]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: mealId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the meal
 *      responses:
 *        "200":
 *          description: Deletes a meal
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Meal'
 *  /rest/meals/{mealId}/picture:
 *    post:
 *      summary: Upload meal image. Not sure how to test with swagger. But it works with chai/mocha!!!
 *      parameters:
 *        - in: path
 *          name: mealId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the meal
 *      tags: [Meals]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "200":
 *          description: Uploads a meal image
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Meal'
 *  /mealinfo/:
 *    get:
 *      summary: Gets all meal info
 *      tags: [Meals]
 *      responses:
 *        "200":
 *          description: A list of meal info schemas
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/MealInfo'
 */
