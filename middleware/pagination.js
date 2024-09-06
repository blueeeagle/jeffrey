const paginate = (items, page, perPage) => {
    console.log('ASVAA..........', page, perPage)
    const offset = perPage * (page - 1)
    const totalPages = Math.ceil(items.length / perPage)
    const paginatedItems = items.slice(offset, perPage * page)
    const current_page = offset / perPage + 1
  
    console.log("totalPages.........", totalPages)
    return {
      previousPage: page - 1 ? true : false,
      nextPage: totalPages > page ? true : false,
      totalDocs: items.length,
      totalPages: totalPages,
      currentPage: current_page,
      items: paginatedItems
    }
  }

  module.exports = {
    paginate
  }