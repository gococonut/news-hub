export default class StringHelper {
  static format = (format, ...args) => {
    let result = (format || '').toString()
    for (let i = 0; i < args.length; i++) {
      const reg = new RegExp(`({)${i}(})`, 'g')
      result = result.replace(reg, args[i])
    }

    return result
  }
}
