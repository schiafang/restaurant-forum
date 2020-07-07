const db = require('../models')
const Comment = db.Comment

module.exports = {
  postComment: (req, res) => {
    const RestaurantId = req.body.restaurantId
    const UserId = req.user.id
    const text = req.body.text
    return Comment.create({ text, RestaurantId, UserId })
      .then(() => res.redirect(`/restaurants/${RestaurantId}`))
  },
  deleteComment: (req, res) => {
    console.log(req.params.id)
    return Comment.findByPk(req.params.id)
      .then(comment => {
        comment.destroy()
          .then(() => res.redirect(`/restaurants/${comment.RestaurantId}`))
      })
  }
}
