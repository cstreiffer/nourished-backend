/**
 * @swagger
 *  components:
 *    schemas:
 *      Hospital:
 *        type: object
 *        required:
 *          - id
 *          - name
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the hospital.
 *          name:
 *            type: string
 *            description: Name of the hospital.
 *          phoneNumber:
 *            type: string
 *            description: Phone number for contact at hosital.
 *          email:
 *            type: string
 *            description: Email address for contact at hosital.
 *          streetAddress:
 *            type: string
 *          zip:
 *            type: string
 *          state:
 *            type: string
 *          dropoffLocation:
 *            type: string
 *          dropoffInfo:
 *            type: string
 * tags:
 *   name: Users
 *   description: User management
 * path:
 *  /hospitals/:
 *    get:
 *      summary: Get all hospitals
 *      tags: [Hospitals]
 *      responses:
 *        "200":
 *          description: Get hospitals
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Hospital'
 *  /hospitals/{hospitalId}:
 *    get:
 *      summary: Get a user by id
 *      tags: [Hospitals]
 *      parameters:
 *        - in: path
 *          name: hospitalId
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the hospital
 *      responses:
 *        "200":
 *          description: Get hospital
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Hospital'
 */
