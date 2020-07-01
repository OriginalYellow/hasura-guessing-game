const QUERY = `
  query gameSessionByPk($id: Int) {
    game_session_by_pk(id: $id) {
      players(order_by: {created_at: asc}) {
        user_id
      }
      secret_number
      winner_id
      id
      completion_status
      closest_guess
      closest_guesser_id
      turn_index
    }
  }
`