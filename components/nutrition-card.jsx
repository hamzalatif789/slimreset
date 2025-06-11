export function NutritionCard({ nutrition, foodName }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h4 className="font-semibold text-gray-800 mb-3 capitalize">{foodName} - Nutrition Facts</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Calories:</span>
          <span className="font-medium">{Math.round(nutrition.calories)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Protein:</span>
          <span className="font-medium">{Math.round(nutrition.protein)}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Fat:</span>
          <span className="font-medium">{Math.round(nutrition.fat)}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Carbs:</span>
          <span className="font-medium">{Math.round(nutrition.carbs)}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Fiber:</span>
          <span className="font-medium">{Math.round(nutrition.fiber)}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Sodium:</span>
          <span className="font-medium">{Math.round(nutrition.sodium)}mg</span>
        </div>
      </div>
    </div>
  )
}
