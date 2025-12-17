const express = require('express');
const { auth, permit } = require('../middleware/auth');
const Event = require('../models/Event');
const { Parser } = require('json2csv');

const router = express.Router();

router.get('/export/events', auth, permit('admin'), async (req,res)=>{
  const events = await Event.find().lean();
  if (req.query.format === 'json') {
    return res.json(events);
  }
  const fields = ['_id','title','description','category','dateStart','dateEnd','location','status','createdBy','attendeesCount'];
  const parser = new Parser({ fields });
  const csv = parser.parse(events);
  res.header('Content-Type','text/csv');
  res.attachment('events.csv');
  res.send(csv);
});

module.exports = router;
