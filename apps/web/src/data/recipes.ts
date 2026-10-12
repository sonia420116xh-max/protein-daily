import type { Recipe, WeightBasis } from '@protein-daily/shared'

const raw = (name: string, weightG: number, weightBasis: WeightBasis = 'raw') => ({ name, weightG, weightBasis })
const cooked = (name: string, weightG: number) => raw(name, weightG, 'cooked')
const recipe = (
  id: string, name: string, mealType: Recipe['mealType'], proteinEstimateG: number,
  min: number, max: number, ingredients: Recipe['ingredients'], tags: string[], notes: string,
): Recipe => ({ id, name, mealType, proteinEstimateG, energyEstimateKcal: { min, max }, ingredients, tags, notes })

export const recipes: Recipe[] = [
  recipe('L01','黑椒牛肉饭','lunch',30,550,650,[raw('瘦牛肉',120),cooked('米饭',200),raw('西兰花',200)],['牛肉','训练前'],'少油翻炒，黑椒按肠胃耐受调整。'),
  recipe('L02','香菇焖鸡腿饭','lunch',34,550,650,[raw('去骨鸡腿肉',150,'boneless'),cooked('米饭',200),raw('香菇青菜',200)],['鸡肉','训练前'],'鸡腿去皮可减少油脂，焖煮时控制酱汁。'),
  recipe('L03','香煎三文鱼饭','lunch',31,550,650,[raw('三文鱼',130),cooked('米饭',180),raw('芦笋/西兰花',200)],['鱼类','训练前'],'少油煎制，搭配足量蔬菜和主食。'),
  recipe('L04','虾仁滑蛋饭','lunch',35,530,620,[raw('虾仁',120,'boneless'),raw('鸡蛋',50),cooked('米饭',200),raw('青菜',200)],['虾','训练前'],'鸡蛋按1个约50g估算，虾仁为去壳生重。'),
  recipe('L05','清蒸鲈鱼饭','lunch',33,480,580,[raw('鲈鱼肉',150,'boneless'),cooked('米饭',200),raw('青菜',200)],['鱼类','训练前'],'鱼肉为去骨可食部分，清蒸少油。'),
  recipe('L06','蘑菇鸡肉饭','lunch',35,500,600,[raw('鸡胸肉',130,'boneless'),cooked('米饭',200),raw('蘑菇青菜',200)],['鸡肉'],'鸡胸肉避免过度煎烤，配菜可轮换。'),
  recipe('L07','番茄炖牛肉饭','lunch',32,530,650,[raw('牛肉',130),cooked('米饭',200),raw('番茄胡萝卜',200)],['牛肉'],'炖煮至软烂，酱汁和用油影响热量。'),
  recipe('L08','虾仁豆腐饭','lunch',36,500,620,[raw('虾仁',100,'boneless'),raw('北豆腐',150),cooked('米饭',180),raw('青菜',200)],['虾','豆制品','训练前'],'适合想轮换动物与植物蛋白时选择。'),
  recipe('L09','鸡肉红薯杂粮饭','lunch',34,550,650,[raw('鸡肉',140,'boneless'),cooked('红薯',150),cooked('米饭',120),raw('蔬菜',200)],['鸡肉','训练前'],'主食分为红薯和米饭，训练日无需过度减量。'),
  recipe('L10','彩椒炒里脊饭','lunch',32,520,630,[raw('猪里脊',130),cooked('米饭',200),raw('彩椒青菜',200)],['训练前'],'里脊切片快炒，控制油和高盐酱料。'),
  recipe('D01','姜葱蒸鸡腿＋米饭','dinner',29,490,580,[raw('鸡腿肉',130,'boneless'),cooked('米饭',180),raw('上海青',200)],['鸡肉','训练前'],'清淡蒸制，适合距训练约2小时食用。'),
  recipe('D02','清蒸鳕鱼＋菠菜饭','dinner',32,450,540,[raw('鳕鱼',150,'boneless'),cooked('米饭',180),raw('菠菜',200)],['鱼类','训练前'],'清蒸少油，口味清淡，训练前更易耐受。'),
  recipe('D03','三文鱼＋南瓜米饭','dinner',31,560,650,[raw('三文鱼',130),cooked('米饭',150),cooked('南瓜',150),raw('青菜',150)],['鱼类','训练后'],'训练后正常吃正餐，不必因有氧过度限制主食。'),
  recipe('D04','番茄虾仁炒蛋＋米饭','dinner',31,480,580,[raw('虾仁',100,'boneless'),raw('鸡蛋',50),cooked('米饭',180),raw('番茄',150),raw('青菜',100)],['虾','训练前'],'少油炒制，鸡蛋按1个约50g估算。'),
  recipe('D05','芦笋炒牛肉＋米饭','dinner',29,500,600,[raw('牛肉',120),cooked('米饭',180),raw('芦笋',200)],['牛肉','训练后'],'牛肉快炒至熟，控制黑椒和酱汁用量。'),
  recipe('D06','虾仁豆腐汤＋米饭','dinner',34,470,570,[raw('虾仁',100,'boneless'),raw('北豆腐',150),cooked('米饭',180),cooked('熟蔬菜',150)],['虾','豆制品','训练前'],'汤品清淡，肠胃不适时按耐受选择。'),
  recipe('D07','香菇鸡肉汤面','dinner',35,490,580,[raw('鸡肉',130,'boneless'),cooked('面条',230),raw('青菜',150),raw('香菇',50)],['鸡肉','训练前'],'汤面避免过油过辣，适合训练前约2小时。'),
  recipe('D08','清蒸海鲈鱼＋米饭','dinner',33,460,550,[raw('鱼肉',150,'boneless'),cooked('米饭',180),raw('西兰花',200)],['鱼类','训练后'],'鱼肉按去骨可食部分计算。'),
  recipe('D09','香煎鸡腿＋红薯','dinner',32,530,640,[raw('鸡腿肉',150,'boneless'),cooked('红薯',250),raw('胡萝卜青菜',200)],['鸡肉'],'少油香煎，鸡腿可去皮降低油脂。'),
  recipe('D10','肉末蒸蛋＋米饭','dinner',31,500,600,[raw('瘦肉末',100),raw('鸡蛋',50),cooked('米饭',180),raw('青菜',200)],['训练后'],'蒸蛋口感温和，鸡蛋按1个约50g估算。'),
]

export const recipeTags = ['训练前','鱼类','鸡肉','牛肉','虾','豆制品']
