/**
 * @swagger
 *  components:
 *    schemas:
 *      Meal:
 *        type: object
 *        required:
 *          - id
 *          - name
 *          - menuId 
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
 *          category:
 *            type: string
 *            description: Type of food. Can be anything.
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
 *            description: Whether the meal can be further edited/deleted. 
 *          userId:
 *            type: boolean
 *            description: ID of the user who created the meal. Should not be returned.  
 *          menuId:
 *            type: boolean
 *            description: ID of the menu the meal is attached to. Menu contains the timeslot information. 
 * tags:
 *   name: Users
 *   description: User management
 * path:
 *  /meals/:
 *    get:
 *      summary: Get all meals
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
 */
