import { body, param, validationResult, matchedData } from 'express-validator';
import passport from './../providers/Passport';
import {{ModelName}} from './../models/{{ModelName}}';
import express from 'express';

export const app = express.Router();


/**
 * GET /api/v1/{{modelnames}}
 * 
 */
app.get('/{{modelnames}}', [
    passport.authenticate('jwt', { session: false })
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        return res.json(
            await {{ModelName}}.findAll()
        );
    } catch (error) {
        return next(error);
    }
});


/**
 * GET /api/v1/{{modelnames}}/:{{modelName}}ID
 * 
 */
app.get('/{{modelnames}}/:{{modelName}}ID', [
    passport.authenticate('jwt', { session: false }),
    param('{{modelName}}ID').exists().isUUID(),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        return res.json(
            await {{ModelName}}.findByPk(req.params.{{modelName}}ID, {
                rejectOnEmpty: true
            })
        ); 
    } catch (error) {
        return next(error);
    }
});


/**
 * POST /api/v1/{{modelnames}}
 * 
 * Create {{ModelName}}
 */
app.post('/{{modelnames}}', [
    passport.authenticate('jwt', { session: false }),
    body('name').exists().isString(),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const {{modelName}} = await {{ModelName}}.create({
            name: data.name,
            {{#userID}}
            userID: '{{userID}}',
            {{/userID}}
            {{#groupID}}
            groupID: '{{groupID}}',
            {{/groupID}}
        });

        return res.json({{modelName}});
    } catch (error) {
        return next(error);
    }
});


/**
 * POST /api/v1/{{modelnames}}/:{{modelName}}ID
 * 
 * Update {{ModelName}}
 */
app.post('/{{modelnames}}/:{{modelName}}ID', [
    passport.authenticate('jwt', { session: false }),
    param('{{modelName}}ID').exists().isUUID(),
    body('name').exists(),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        await {{ModelName}}.update(data, {
            where: {
                id: req.params.{{modelName}}ID,
            }
        });

        return res.json(await {{ModelName}}.findByPk(req.params.{{modelName}}ID));
    } catch (error) {
        return next(error);
    }
});



/**
 * DELETE /api/v1/{{modelnames}}/:{{modelName}}ID
 * 
 * Delete {{ModelName}}
 */
app.delete('/{{modelnames}}/:{{modelName}}ID', [
    passport.authenticate('jwt', { session: false }),
    param('{{modelName}}ID').exists().isUUID(),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        await {{ModelName}}.destroy({
            where: {
                id: req.params.{{modelName}}ID,
            }
        });

        return res.json({ id: req.params.{{modelName}}ID });
    } catch (error) {
        return next(error);
    }
});
