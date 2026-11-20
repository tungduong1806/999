'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type Lang = 'vi' | 'en' | 'ja'

export const LANGS: { id: Lang; short: string; native: string; locale: string }[] = [
  { id: 'vi', short: 'VI', native: 'Tiếng Việt', locale: 'vi-VN' },
  { id: 'en', short: 'EN', native: 'English', locale: 'en-US' },
  { id: 'ja', short: 'JA', native: '日本語', locale: 'ja-JP' },
]

const vi = {
  'app.name': 'Thở Sạch',
  'app.tagline': 'Giám sát không khí và cảnh báo mưa lũ theo từng khu vực',

  'nav.label': 'Các mục chính',
  'nav.today': 'Hôm nay',
  'nav.home': 'Quê nhà',
  'nav.map': 'Bản đồ',
  'nav.ask': 'Hỏi thăm',
  'nav.about': 'Giới thiệu',
  'nav.share': 'Chia sẻ',
  'nav.github': 'Mã nguồn trên GitHub',
  'nav.tools': 'Tiện ích',
  'nav.language': 'Ngôn ngữ',
  'nav.changePlace': 'Đổi nơi',

  'common.noData': 'chưa có số liệu',
  'common.newTab': '(mở tab mới)',
  'common.close': 'Đóng',
  'common.retry': 'Thử lại',

  'offline.banner': 'Bạn đang ngoại tuyến.',
  'offline.last': 'Đang hiển thị số liệu lưu lần cuối lúc {time}.',
  'offline.none': 'Chưa có số liệu đã lưu để hiển thị.',

  'share.title': 'Thở Sạch: chất lượng không khí và cảnh báo lũ',
  'share.text': 'Xem nhanh hôm nay có cần đeo khẩu trang không.',
  'share.copied': 'Đã sao chép liên kết',

  'about.title': 'Giới thiệu Thở Sạch',
  'about.desc':
    'Thở Sạch giúp bạn biết nhanh hôm nay có cần đeo khẩu trang không và quê nhà có nguy cơ mưa lũ không. Dữ liệu là số ước tính từ mô hình, không phải số đo tại trạm.',
  'about.sources': 'Nguồn dữ liệu',
  'about.privacy': 'Quyền riêng tư',
  'about.privacyText': 'Danh sách địa điểm được lưu trên thiết bị. Tọa độ làm tròn được gửi đi để lấy dự báo. Khi dùng trợ lý, câu hỏi và tên địa điểm được gửi tới dịch vụ AI; ứng dụng không lưu câu hỏi vào cơ sở dữ liệu.',
  'about.emergency': 'Số khẩn cấp ở Việt Nam',
  'about.police': 'Công an',
  'about.fire': 'Cứu hỏa',
  'about.ambulance': 'Cấp cứu',
  'about.disclaimer': 'Dữ liệu mang tính tham khảo. Khi có cảnh báo, hãy theo thông báo của chính quyền địa phương.',

  'footer.product': 'Tính năng',
  'footer.sources': 'Nguồn dữ liệu',
  'footer.emergency': 'Khẩn cấp',
  'footer.developedBy': 'Phát triển bởi',
  'footer.rights': 'Mọi quyền được bảo lưu.',
  'footer.blurb': 'Theo dõi chất lượng không khí và nguy cơ mưa lũ theo từng khu vực. Số liệu mô hình từ Open-Meteo.',
  'footer.backToTop': 'Lên đầu trang',
  'footer.moreTracking': 'Theo dõi thêm',
  'footer.basemap': 'Bản đồ nền',
  'footer.radar': 'Ra-đa mưa',
  'footer.quakes': 'Động đất',
  'footer.weather': 'Thời tiết và không khí',

  'error.fetch': 'Chưa lấy được dữ liệu từ {source}.',

  'first.title': 'Bạn đang ở đâu hôm nay?',
  'first.desc': 'Chọn nơi bạn đang học hoặc làm việc để xem hôm nay có cần đeo khẩu trang không.',

  'air.title': 'Chất lượng không khí ngay bây giờ',
  'air.loading': 'Đang lấy chất lượng không khí…',
  'air.aqiAt': 'AQI Mỹ, lúc {time}',
  'air.estimate': 'Số ước tính từ mô hình, có thể khác trạm đo.',
  'air.pm25': 'Bụi mịn PM2.5:',
  'air.next24': '24 giờ tới',
  'air.stripName': 'Chất lượng không khí 24 giờ tới',
  'air.cleanest': 'Sạch nhất {range}',
  'air.cellNoData': '{time}: chưa có số liệu',
  'air.cell': '{time}: AQI {aqi}, {level}',
  'air.cleanerWindow': 'Khung giờ sạch hơn trong ngày là {range}.',

  'aqi.tot': 'Tốt',
  'aqi.trung-binh': 'Trung bình',
  'aqi.kem': 'Kém',
  'aqi.xau': 'Xấu',
  'aqi.rat-xau': 'Rất xấu',
  'aqi.nguy-hai': 'Nguy hại',

  'advice.tot': 'Không khí tốt. Không cần khẩu trang lọc bụi.',
  'advice.trung-binh': 'Không khí ở mức chấp nhận được. Người nhạy cảm nên hạn chế ở ngoài trời quá lâu.',
  'advice.kem': 'Không khí kém. Đeo khẩu trang lọc bụi mịn nếu đi xe máy lâu.',
  'advice.xau': 'Không khí xấu. Đeo khẩu trang lọc bụi mịn khi ra ngoài và tránh tập thể dục ngoài trời.',
  'advice.rat-xau': 'Không khí rất xấu. Hạn chế ra ngoài. Nếu phải đi, đeo khẩu trang N95 hoặc tương đương.',
  'advice.nguy-hai':
    'Không khí ở mức nguy hại. Ở trong nhà nếu có thể, đóng kín cửa và đeo khẩu trang N95 khi buộc phải ra ngoài.',

  'weather.title': 'Thời tiết lúc này',
  'weather.loading': 'Đang lấy thời tiết…',
  'weather.temp': 'Nhiệt độ',
  'weather.rain': 'Khả năng mưa',
  'weather.wind': 'Gió',

  'home.title': 'Quê nhà',
  'home.add': 'Thêm nơi',
  'home.empty': 'Lưu tối đa {max} nơi ở quê để xem lượng mưa và mực nước sông ở đó, kể cả khi bạn đang ở xa.',
  'home.addFirst': 'Thêm nơi ở quê',
  'home.compose': 'Soạn tin hỏi thăm',
  'home.v2': 'Có ở phiên bản 2',
  'home.remove': 'Xóa',
  'home.removeAria': 'Xóa {name}',
  'home.rainLoading': 'Đang lấy lượng mưa…',
  'home.rain3': 'Mưa 3 ngày tới:',
  'river.loading': 'Đang lấy số liệu sông…',
  'river.peak': 'Sông, cao nhất trong 7 ngày tới:',
  'river.note': 'Lưu lượng mô hình so với mức trung vị theo mùa, không phải mực nước đo tại trạm.',
  'river.stripName': 'Lưu lượng sông 7 ngày tới',
  'river.cell': '{day}: {state}, gấp {ratio} lần mức thường',
  'river.cellNoData': '{day}: chưa có số liệu',
  'river.none': 'Chưa có số liệu sông cho nơi này.',
  'river.legend': 'Chú giải màu lưu lượng sông',
  'river.normal': 'Bình thường',
  'river.high': 'Cao hơn bình thường',
  'river.extreme': 'Cao bất thường',

  'map.disclaimer': 'Dữ liệu mang tính tham khảo. Khi có cảnh báo, hãy theo thông báo của chính quyền địa phương.',
 'map.openGoogle': 'Mở Google Maps',
 'map.googleEmbed': 'Google Maps trong trang',
 'map.googleNote': 'Đang xem Google Maps. Tắt chế độ này để quay lại bản đồ radar mưa và động đất.',
  'map.loading': 'Đang tải bản đồ…',
  'map.region': 'Bản đồ Việt Nam',
  'map.layers': 'Lớp bản đồ',
  'map.collapse': 'Thu gọn',
  'map.expand': 'Mở',
  'map.radar': 'Ra-đa mưa',
  'map.quakes': 'Động đất 30 ngày',
  'map.radarLoading': 'Đang lấy ảnh ra-đa…',
  'map.radarHelp': 'Kéo dải để xem ra-đa theo thời gian. Ô xám nhạt là dự báo ngắn hạn.',
  'map.radarFrame': 'Khung hình ra-đa',
  'map.radarAt': 'Ra-đa lúc {time}',
  'map.forecast': 'dự báo',
  'map.quakeLoading': 'Đang lấy dữ liệu động đất…',
  'map.quakeCount': '{count} trận từ M 3 trở lên trong vùng quanh Việt Nam. Chạm vào chấm để xem chi tiết.',
  'quake.title': 'Động đất 30 ngày qua',
  'quake.enable': 'Bật lớp “Động đất 30 ngày” để xem danh sách.',
  'quake.none': 'Không có trận động đất M 3 trở lên nào được ghi nhận trong vùng này suốt 30 ngày qua.',
  'quake.view': 'Xem trên USGS',
  'quake.popup': 'Động đất M {mag}',
  'quake.unknown': 'Không rõ vị trí',

  'picker.name': 'Tên nơi',
  'picker.placeholder': 'Tìm phường, quận, thành phố…',
  'picker.help': 'Nhập tên phường, quận hoặc thành phố, ví dụ Cầu Giấy hoặc Vinh.',
  'picker.searching': 'Đang tìm…',
  'picker.none': 'Không tìm thấy nơi nào tên “{query}”. Thử viết có dấu hoặc dùng tên rộng hơn.',
  'picker.or': 'Hoặc chọn theo tỉnh và phường/xã',
  'picker.province': 'Tỉnh/thành',
  'picker.ward': 'Phường/xã',
  'picker.loadingList': 'Đang tải danh sách…',
  'picker.selectProvince': 'Chọn tỉnh/thành',
  'picker.selectProvinceFirst': 'Chọn tỉnh/thành trước',
  'picker.selectWard': 'Chọn phường/xã',
  'picker.resolveError': 'Chưa tìm được tọa độ cho nơi này. Thử tìm theo tên ở trên.',
  'picker.use': 'Dùng nơi này',
  'picker.resolving': 'Đang tìm tọa độ…',
  'picker.approx': '{province} (vị trí ước tính theo tỉnh)',

  'sheet.addHome': 'Thêm nơi ở quê',
  'sheet.change': 'Đổi nơi bạn đang học',
  'sheet.full': 'Bạn đã lưu đủ {max} nơi. Xóa bớt một nơi ở tab Quê nhà để thêm nơi mới.',

  'ask.title': 'Hỏi thăm',
  'ask.p1': 'Xem dự báo theo giờ và hỏi AI để lên kế hoạch cho ngày của bạn.',
  'ask.p2': 'Để DeepSeek trả lời, ứng dụng gửi câu hỏi, tên địa điểm và dữ liệu dự báo qua DeepSeek, FPT Cloud hoặc Vercel AI Gateway, tùy cấu hình. Đừng nhập thông tin cá nhân.',

   'info.heading': 'Dữ liệu môi trường dễ hiểu cho học sinh, sinh viên và người xa quê',
  'info.lead':
    'Thở Sạch tổng hợp số liệu mô hình về chất lượng không khí, lượng mưa và mực nước theo từng phường, xã. Bạn nhận được một câu trả lời rõ ràng cho mỗi ngày: có cần đeo khẩu trang không, nên ra ngoài lúc nào, và quê nhà có đang gặp mưa lũ không.',
  'info.f1.title': 'Chất lượng không khí theo giờ',
  'info.f1.desc': 'Chỉ số AQI, bụi mịn PM2.5 và khuyến nghị sức khỏe được cập nhật theo từng giờ, kèm gợi ý khung giờ sạch nhất trong ngày.',
  'info.f2.title': 'Cảnh báo mưa và lũ',
  'info.f2.desc': 'Theo dõi lượng mưa dự báo, ra-đa mưa và nguy cơ ngập để chủ động phòng tránh trước khi thời tiết xấu đến.',
  'info.f3.title': 'Quê nhà trong tầm tay',
  'info.f3.desc': 'Lưu nhiều nơi như quê nội, quê ngoại hay nhà người thân và xem tình hình của tất cả chỉ với một lần chạm.',
  'info.f4.title': 'Riêng tư và ngoại tuyến',
  'info.f4.desc': 'Danh sách địa điểm lưu trên thiết bị. Một số dữ liệu đã tải vẫn xem được khi mất mạng; dự báo chi tiết và AI cần kết nối.',
  'info.how.title': 'Cách hoạt động',
  'info.how.1.title': 'Chọn khu vực',
  'info.how.1.desc': 'Tìm theo tên phường, quận, thành phố hoặc chọn theo tỉnh và phường/xã.',
  'info.how.2.title': 'Xem số liệu mô hình',
  'info.how.2.desc': 'Ứng dụng lấy dữ liệu từ Open-Meteo và quy đổi sang thang AQI Mỹ cùng mức độ ảnh hưởng đến sức khỏe.',
  'info.how.3.title': 'Hành động kịp thời',
  'info.how.3.desc': 'Nhận khuyến nghị đeo khẩu trang, giờ nên ra ngoài và cảnh báo mưa lũ tại quê nhà.',
  'info.faq.title': 'Câu hỏi thường gặp',
  'info.faq.1.q': 'Số liệu có chính xác như trạm quan trắc không?',
  'info.faq.1.a': 'Không. Đây là số ước tính từ mô hình toàn cầu nên có thể lệch so với trạm đo tại chỗ. Hãy dùng như tham khảo nhanh và đối chiếu với nguồn chính thức khi cần.',
  'info.faq.2.q': 'AQI bao nhiêu thì cần đeo khẩu trang?',
  'info.faq.2.a': 'Từ mức 101 trở lên, nhóm nhạy cảm như trẻ em, người già và người có bệnh hô hấp nên hạn chế ra ngoài và đeo khẩu trang lọc bụi mịn. Từ 151, mọi người nên đeo khẩu trang khi ra đường.',
  'info.faq.3.q': 'Dữ liệu của tôi có bị gửi đi đâu không?',
  'info.faq.3.a': 'Không. Danh sách nơi bạn lưu chỉ nằm trong bộ nhớ của trình duyệt trên thiết bị này. Ứng dụng chỉ gửi tọa độ khu vực tới Open-Meteo để lấy số liệu.',
  'info.faq.4.q': 'Tôi có thể dùng trên iPhone và Android không?',
  'info.faq.4.a': 'Có. Giao diện được tối ưu cho điện thoại. Bạn có thể thêm vào Màn hình chính để mở như một ứng dụng.',

  'wd.0': 'CN',
  'wd.1': 'T2',
  'wd.2': 'T3',
  'wd.3': 'T4',
  'wd.4': 'T5',
  'wd.5': 'T6',
  'wd.6': 'T7',
} as const

export type TKey = keyof typeof vi
type Dict = Record<TKey, string>

const en: Dict = {
  'app.name': 'Thở Sạch',
  'app.tagline': 'Local air quality monitoring and flood alerts',

  'nav.label': 'Main sections',
  'nav.today': 'Today',
  'nav.home': 'Hometown',
  'nav.map': 'Map',
  'nav.ask': 'Check in',
  'nav.about': 'About',
  'nav.share': 'Share',
  'nav.github': 'Source code on GitHub',
  'nav.tools': 'Tools',
  'nav.language': 'Language',
  'nav.changePlace': 'Change place',

  'common.noData': 'no data yet',
  'common.newTab': '(opens in a new tab)',
  'common.close': 'Close',
  'common.retry': 'Try again',

  'offline.banner': 'You are offline.',
  'offline.last': 'Showing data last saved at {time}.',
  'offline.none': 'There is no saved data to show yet.',

  'share.title': 'Thở Sạch: air quality and flood alerts',
  'share.text': 'Check at a glance whether you need a mask today.',
  'share.copied': 'Link copied',

  'about.title': 'About Thở Sạch',
  'about.desc':
    'Thở Sạch tells you at a glance whether you need a mask today and whether your hometown is at risk of floods. Figures are model estimates, not station measurements.',
  'about.sources': 'Data sources',
  'about.privacy': 'Privacy',
  'about.privacyText': 'Your saved places are kept on your device. Rounded coordinates are sent to get the detailed forecast. When you use the assistant, your question and the place name are sent to the AI service; the app does not store questions in its database.',
  'about.emergency': 'Emergency numbers in Vietnam',
  'about.police': 'Police',
  'about.fire': 'Fire',
  'about.ambulance': 'Ambulance',
  'about.disclaimer': 'Data is for reference only. When an alert is issued, follow your local authorities.',

  'footer.product': 'Features',
  'footer.sources': 'Data sources',
  'footer.emergency': 'Emergency',
  'footer.developedBy': 'Developed by',
  'footer.rights': 'All rights reserved.',
  'footer.blurb': 'Track air quality and flood risk for any area. Model data from Open-Meteo.',
  'footer.backToTop': 'Back to top',
  'footer.moreTracking': 'More official sources',
  'footer.basemap': 'Base map',
  'footer.radar': 'Rain radar',
  'footer.quakes': 'Earthquakes',
  'footer.weather': 'Weather and air quality',

  'error.fetch': 'Could not get data from {source}.',

  'first.title': 'Where are you today?',
  'first.desc': 'Pick where you study or work to see whether you need a mask today.',

  'air.title': 'Air quality right now',
  'air.loading': 'Getting air quality…',
  'air.aqiAt': 'US AQI, at {time}',
  'air.estimate': 'A model estimate, which may differ from a monitoring station.',
  'air.pm25': 'Fine dust PM2.5:',
  'air.next24': 'Next 24 hours',
  'air.stripName': 'Air quality for the next 24 hours',
  'air.cleanest': 'Cleanest {range}',
  'air.cellNoData': '{time}: no data yet',
  'air.cell': '{time}: AQI {aqi}, {level}',
  'air.cleanerWindow': 'A cleaner time window today is {range}.',

  'aqi.tot': 'Good',
  'aqi.trung-binh': 'Moderate',
  'aqi.kem': 'Poor',
  'aqi.xau': 'Unhealthy',
  'aqi.rat-xau': 'Very unhealthy',
  'aqi.nguy-hai': 'Hazardous',

  'advice.tot': 'Air is good. You do not need a dust mask.',
  'advice.trung-binh': 'Air is acceptable. Sensitive people should limit long periods outdoors.',
  'advice.kem': 'Air is poor. Wear a fine-dust mask if you ride a motorbike for a long time.',
  'advice.xau': 'Air is unhealthy. Wear a fine-dust mask outside and avoid exercising outdoors.',
  'advice.rat-xau': 'Air is very unhealthy. Limit going outside. If you must, wear an N95 mask or equivalent.',
  'advice.nguy-hai':
    'Air is hazardous. Stay indoors if you can, keep windows closed and wear an N95 mask if you must go out.',

  'weather.title': 'Weather right now',
  'weather.loading': 'Getting the weather…',
  'weather.temp': 'Temperature',
  'weather.rain': 'Chance of rain',
  'weather.wind': 'Wind',

  'home.title': 'Hometown',
  'home.add': 'Add a place',
  'home.empty': 'Save up to {max} hometown places to see rainfall and river levels there, even when you are far away.',
  'home.addFirst': 'Add a hometown',
  'home.compose': 'Write a check-in message',
  'home.v2': 'Coming in version 2',
  'home.remove': 'Remove',
  'home.removeAria': 'Remove {name}',
  'home.rainLoading': 'Getting rainfall…',
  'home.rain3': 'Rain in the next 3 days:',
  'river.loading': 'Getting river data…',
  'river.peak': 'River, highest in the next 7 days:',
  'river.note': 'Modelled discharge compared with the seasonal median, not a water level measured at a station.',
  'river.stripName': 'River discharge for the next 7 days',
  'river.cell': '{day}: {state}, {ratio}× the usual level',
  'river.cellNoData': '{day}: no data yet',
  'river.none': 'There is no river data for this place yet.',
  'river.legend': 'River discharge colour key',
  'river.normal': 'Normal',
  'river.high': 'Higher than normal',
  'river.extreme': 'Unusually high',

  'map.disclaimer': 'Data is for reference only. When an alert is issued, follow your local authorities.',
 'map.openGoogle': 'Open Google Maps',
 'map.googleEmbed': 'Embedded Google Maps',
 'map.googleNote': 'Viewing Google Maps. Turn it off to return to the rain radar and earthquake layers.',
  'map.loading': 'Loading the map…',
  'map.region': 'Map of Vietnam',
  'map.layers': 'Map layers',
  'map.collapse': 'Collapse',
  'map.expand': 'Expand',
  'map.radar': 'Rain radar',
  'map.quakes': 'Earthquakes, 30 days',
  'map.radarLoading': 'Getting radar images…',
  'map.radarHelp': 'Drag the strip to scrub the radar through time. Pale grey cells are a short-term forecast.',
  'map.radarFrame': 'Radar frame',
  'map.radarAt': 'Radar at {time}',
  'map.forecast': 'forecast',
  'map.quakeLoading': 'Getting earthquake data…',
  'map.quakeCount': '{count} earthquakes of M 3 or higher around Vietnam. Tap a dot for details.',
  'quake.title': 'Earthquakes in the last 30 days',
  'quake.enable': 'Turn on the “Earthquakes, 30 days” layer to see the list.',
  'quake.none': 'No earthquakes of M 3 or higher were recorded in this region over the last 30 days.',
  'quake.view': 'View on USGS',
  'quake.popup': 'Earthquake M {mag}',
  'quake.unknown': 'Unknown location',

  'picker.name': 'Place name',
  'picker.placeholder': 'Search a ward, district or city…',
  'picker.help': 'Type the name of a ward, district or city, for example Cầu Giấy or Vinh.',
  'picker.searching': 'Searching…',
  'picker.none': 'No place found named “{query}”. Try diacritics or a broader name.',
  'picker.or': 'Or pick by province and ward/commune',
  'picker.province': 'Province/city',
  'picker.ward': 'Ward/commune',
  'picker.loadingList': 'Loading the list…',
  'picker.selectProvince': 'Select a province/city',
  'picker.selectProvinceFirst': 'Select a province/city first',
  'picker.selectWard': 'Select a ward/commune',
  'picker.resolveError': 'Could not find coordinates for this place. Try searching by name above.',
  'picker.use': 'Use this place',
  'picker.resolving': 'Finding coordinates…',
  'picker.approx': '{province} (position estimated from the province)',

  'sheet.addHome': 'Add a hometown',
  'sheet.change': 'Change where you study or work',
  'sheet.full': 'You have saved all {max} places. Remove one in the Hometown tab to add another.',

  'ask.title': 'Check in',
  'ask.p1': 'See the hourly forecast and ask AI to help plan your day.',
  'ask.p2': 'To get an answer from DeepSeek, this app sends your question, place name, and forecast data via DeepSeek, FPT Cloud, or Vercel AI Gateway, depending on configuration. Do not include personal information.',

   'info.heading': 'Clear environmental insight for students, workers and families far from home',
  'info.lead':
    'Thở Sạch brings together modelled air quality, rainfall and river-level data for every ward and commune. You get one clear answer each day: whether to wear a mask, when it is best to go outside, and whether your hometown is facing heavy rain or flooding.',
  'info.f1.title': 'Hourly air quality',
  'info.f1.desc': 'AQI, PM2.5 and health guidance refreshed every hour, with a suggestion for the cleanest time window of the day.',
  'info.f2.title': 'Rain and flood alerts',
  'info.f2.desc': 'Follow forecast rainfall, rain radar and flood risk so you can prepare before the weather turns.',
  'info.f3.title': 'Hometown at a glance',
  'info.f3.desc': 'Save several places such as grandparents or relatives and check every one of them with a single tap.',
  'info.f4.title': 'Private and offline-ready',
  'info.f4.desc': 'Your saved places stay on your device. Some previously loaded data is available offline; the detailed forecast and AI need a connection.',
  'info.how.title': 'How it works',
  'info.how.1.title': 'Pick an area',
  'info.how.1.desc': 'Search by ward, district or city, or browse by province and ward/commune.',
  'info.how.2.title': 'Read the model data',
  'info.how.2.desc': 'Data comes from Open-Meteo and is converted to the US AQI scale with matching health levels.',
  'info.how.3.title': 'Act in time',
  'info.how.3.desc': 'Get mask advice, the best hours to go out, and rain and flood alerts for your hometown.',
  'info.faq.title': 'Frequently asked questions',
  'info.faq.1.q': 'Is the data as accurate as a monitoring station?',
  'info.faq.1.a': 'No. These are estimates from a global model and can differ from local stations. Use them as a quick reference and check official sources when it matters.',
  'info.faq.2.q': 'At what AQI should I wear a mask?',
  'info.faq.2.a': 'From 101, sensitive groups such as children, older adults and people with respiratory conditions should limit time outdoors and wear a fine-particle mask. From 151, everyone should wear one outside.',
  'info.faq.3.q': 'Is my data sent anywhere?',
  'info.faq.3.a': 'No. Your saved places live only in this browser on this device. The app sends only the area coordinates to Open-Meteo to fetch data.',
  'info.faq.4.q': 'Does it work on iPhone and Android?',
  'info.faq.4.a': 'Yes. The interface is optimised for phones, and you can add it to your Home Screen to open it like an app.',

  'wd.0': 'Sun',
  'wd.1': 'Mon',
  'wd.2': 'Tue',
  'wd.3': 'Wed',
  'wd.4': 'Thu',
  'wd.5': 'Fri',
  'wd.6': 'Sat',
}

const ja: Dict = {
  'app.name': 'Thở Sạch',
  'app.tagline': '地域別の大気質モニタリングと洪水アラート',

  'nav.label': 'メインメニュー',
  'nav.today': '今日',
  'nav.home': '故郷',
  'nav.map': '地図',
  'nav.ask': '安否確認',
  'nav.about': '概要',
  'nav.share': '共有',
  'nav.github': 'GitHub のソースコード',
  'nav.tools': 'ツール',
  'nav.language': '言語',
  'nav.changePlace': '場所を変更',

  'common.noData': 'データなし',
  'common.newTab': '(新しいタブで開く)',
  'common.close': '閉じる',
  'common.retry': '再試行',

  'offline.banner': 'オフラインです。',
  'offline.last': '{time} に保存した最後のデータを表示しています。',
  'offline.none': '表示できる保存済みデータがまだありません。',

  'share.title': 'Thở Sạch: 大気質と洪水リスクの情報',
  'share.text': '今日マスクが必要かどうかをすぐに確認できます。',
  'share.copied': 'リンクをコピーしました',

  'about.title': 'アプリの紹介',
  'about.desc':
    'Thở Sạch は、今日マスクが必要か、故郷に洪水の恐れがあるかをすぐに確認できるアプリです。数値は観測所の実測ではなく、モデルによる推定値です。',
  'about.sources': 'データ提供元',
  'about.privacy': 'プライバシー',
  'about.privacyText': '保存した地点の一覧は端末に保持されます。詳細な予報を取得するため、丸めた座標を送信します。AI に質問すると、質問と地点名が AI サービスに送信されます。アプリのデータベースに質問は保存しません。',
  'about.emergency': 'ベトナムの緊急連絡先',
  'about.police': '警察',
  'about.fire': '消防',
  'about.ambulance': '救急',
  'about.disclaimer': 'データは参考情報です。警報が出た場合は、地元自治体の指示に従ってください。',

  'footer.product': '機能',
  'footer.sources': 'データ提供元',
  'footer.emergency': '緊急連絡',
  'footer.developedBy': '開発者',
  'footer.rights': 'All rights reserved.',
  'footer.blurb': '地域ごとの大気質と洪水リスクを確認。Open-Meteo のモデルデータを使用。',
  'footer.backToTop': 'ページの先頭へ',
  'footer.moreTracking': '公的情報サイト',
  'footer.basemap': 'ベースマップ',
  'footer.radar': '雨雲レーダー',
  'footer.quakes': '地震',
  'footer.weather': '天気と大気質',

  'error.fetch': '{source} からデータを取得できませんでした。',

  'first.title': '今日はどこにいますか?',
  'first.desc': '通学・通勤している場所を選ぶと、今日マスクが必要かどうかが分かります。',

  'air.title': '現在の大気質',
  'air.loading': '大気質を取得しています…',
  'air.aqiAt': '米国 AQI、{time} 時点',
  'air.estimate': 'モデルによる推定値で、観測所の値と異なる場合があります。',
  'air.pm25': '微小粒子 PM2.5:',
  'air.next24': '今後24時間',
  'air.stripName': '今後24時間の大気質',
  'air.cleanest': '最もきれい {range}',
  'air.cellNoData': '{time}: データなし',
  'air.cell': '{time}: AQI {aqi}、{level}',
  'air.cleanerWindow': '今日の中で空気がきれいな時間帯は {range} です。',

  'aqi.tot': '良い',
  'aqi.trung-binh': '普通',
  'aqi.kem': '悪い',
  'aqi.xau': '健康に悪い',
  'aqi.rat-xau': '非常に悪い',
  'aqi.nguy-hai': '危険',

  'advice.tot': '空気は良好です。防塵マスクは不要です。',
  'advice.trung-binh': '空気は許容範囲です。敏感な方は、長時間の屋外活動を控えてください。',
  'advice.kem': '空気が悪い状態です。バイクで長く走る場合は微小粒子用マスクを着用してください。',
  'advice.xau': '空気が健康に悪い状態です。外出時は微小粒子用マスクを着用し、屋外での運動は避けてください。',
  'advice.rat-xau': '空気が非常に悪い状態です。外出は控えてください。外出する場合は N95 マスクなどを着用してください。',
  'advice.nguy-hai':
    '空気が危険な状態です。できるだけ屋内で過ごし、窓を閉め、やむを得ず外出する場合は N95 マスクを着用してください。',

  'weather.title': '現在の天気',
  'weather.loading': '天気を取得しています…',
  'weather.temp': '気温',
  'weather.rain': '降水確率',
  'weather.wind': '風速',

  'home.title': '故郷',
  'home.add': '場所を追加',
  'home.empty': '故郷の場所を最大 {max} か所まで保存すると、遠くにいても降水量と河川の状況を確認できます。',
  'home.addFirst': '故郷を追加',
  'home.compose': '安否メッセージを作成',
  'home.v2': 'バージョン 2 で対応予定',
  'home.remove': '削除',
  'home.removeAria': '{name} を削除',
  'home.rainLoading': '降水量を取得しています…',
  'home.rain3': '今後3日間の雨量:',
  'river.loading': '河川データを取得しています…',
  'river.peak': '河川、今後7日間の最高:',
  'river.note': '季節ごとの中央値と比べたモデル上の流量で、観測所で測った水位ではありません。',
  'river.stripName': '今後7日間の河川流量',
  'river.cell': '{day}: {state}、平年の {ratio} 倍',
  'river.cellNoData': '{day}: データなし',
  'river.none': 'この場所の河川データはまだありません。',
  'river.legend': '河川流量の色の凡例',
  'river.normal': '平常',
  'river.high': '平年より多い',
  'river.extreme': '異常に多い',

  'map.disclaimer': 'データは参考情報です。警報が出た場合は、地元自治体の指示に従ってください。',
 'map.openGoogle': 'Google マップを開く',
 'map.googleEmbed': '埋め込み Google マップ',
 'map.googleNote': 'Google マップを表示しています。この表示をオフにすると、雨雲レーダーと地震のレイヤーに戻ります。',
  'map.loading': '地図を読み込んでいます…',
  'map.region': 'ベトナムの地図',
  'map.layers': '地図レイヤー',
  'map.collapse': '折りたたむ',
  'map.expand': '開く',
  'map.radar': '雨雲レーダー',
  'map.quakes': '地震 30日間',
  'map.radarLoading': 'レーダー画像を取得しています…',
  'map.radarHelp': 'バーをドラッグして時間を動かせます。薄い灰色のセルは短時間の予測です。',
  'map.radarFrame': 'レーダーのフレーム',
  'map.radarAt': '{time} のレーダー',
  'map.forecast': '予測',
  'map.quakeLoading': '地震データを取得しています…',
  'map.quakeCount': 'ベトナム周辺で M 3 以上の地震が {count} 件。点をタップすると詳細が表示されます。',
  'quake.title': '過去30日間の地震',
  'quake.enable': '「地震 30日間」レイヤーをオンにすると一覧が表示されます。',
  'quake.none': 'この地域では過去30日間に M 3 以上の地震は記録されていません。',
  'quake.view': 'USGS で見る',
  'quake.popup': '地震 M {mag}',
  'quake.unknown': '場所不明',

  'picker.name': '場所の名前',
  'picker.placeholder': '区・郡・市の名前を検索…',
  'picker.help': '区・郡・市の名前を入力してください。例: Cầu Giấy、Vinh',
  'picker.searching': '検索中…',
  'picker.none': '「{query}」という場所は見つかりませんでした。ベトナム語の発音記号付きで入力するか、より広い名前でお試しください。',
  'picker.or': 'または省と区・社から選ぶ',
  'picker.province': '省・市',
  'picker.ward': '区・社',
  'picker.loadingList': '一覧を読み込み中…',
  'picker.selectProvince': '省・市を選択',
  'picker.selectProvinceFirst': '先に省・市を選択',
  'picker.selectWard': '区・社を選択',
  'picker.resolveError': 'この場所の座標が見つかりませんでした。上の名前検索をお試しください。',
  'picker.use': 'この場所を使う',
  'picker.resolving': '座標を検索中…',
  'picker.approx': '{province}(位置は省から推定)',

  'sheet.addHome': '故郷を追加',
  'sheet.change': '通学・通勤先を変更',
  'sheet.full': '{max} か所すべて保存済みです。追加するには「故郷」タブで1つ削除してください。',

  'ask.title': '安否確認',
  'ask.p1': '時間別の天気予報を確認し、AI に質問して一日の予定を立てましょう。',
  'ask.p2': 'DeepSeek が回答するために、質問、地点名、予報データは設定に応じて DeepSeek、FPT Cloud、または Vercel AI Gateway に送信されます。個人情報は入力しないでください。',

  'info.heading': '学生・社会人・故郷を離れた家族のための、わかりやすい環境情報',
  'info.lead':
    'Thở Sạch は、地区ごとの大気質・降水量・河川水位のモデルデータをまとめて表示します。マスクが必要か、外出に適した時間帯はいつか、故郷で大雨や洪水の恐れはないか。毎日の判断に必要な答えをひと目で確認できます。',
  'info.f1.title': '1時間ごとの大気質',
  'info.f1.desc': 'AQI と PM2.5、健康への目安を毎時更新。1日のうち最も空気がきれいな時間帯も提案します。',
  'info.f2.title': '大雨・洪水アラート',
  'info.f2.desc': '予測降水量、雨雲レーダー、浸水リスクを確認して、天候が崩れる前に備えられます。',
  'info.f3.title': '故郷をすぐ確認',
  'info.f3.desc': '祖父母や親戚の住む地域を複数保存し、ワンタップでまとめて確認できます。',
  'info.f4.title': 'プライバシーとオフライン',
  'info.f4.desc': '保存した地点の一覧は端末に保持されます。一部の取得済みデータはオフラインで閲覧できますが、詳細な予報と AI には通信が必要です。',
  'info.how.title': '使い方',
  'info.how.1.title': '地域を選ぶ',
  'info.how.1.desc': '区・市の名前で検索するか、省と区・村から選択します。',
  'info.how.2.title': 'モデルデータを見る',
  'info.how.2.desc': 'Open-Meteo のデータを米国 AQI 基準に換算し、健康への影響レベルとあわせて表示します。',
  'info.how.3.title': '早めに行動する',
  'info.how.3.desc': 'マスクの要否、外出に適した時間、故郷の大雨・洪水アラートを受け取れます。',
  'info.faq.title': 'よくある質問',
  'info.faq.1.q': '観測所と同じ精度ですか？',
  'info.faq.1.a': 'いいえ。全球モデルによる推定値のため、現地の観測値とは異なる場合があります。目安として使い、重要な場面では公的情報もご確認ください。',
  'info.faq.2.q': 'AQI がいくつからマスクが必要ですか？',
  'info.faq.2.a': '101 以上では、子ども・高齢者・呼吸器疾患のある方は外出を控え、微小粒子対応のマスクを着用してください。151 以上では全員の着用を推奨します。',
  'info.faq.3.q': 'データはどこかに送信されますか？',
  'info.faq.3.a': 'いいえ。保存した場所はこの端末のブラウザ内にのみ保存されます。データ取得のため、地域の座標のみを Open-Meteo に送信します。',
  'info.faq.4.q': 'iPhone や Android で使えますか？',
  'info.faq.4.a': 'はい。スマートフォン向けに最適化されており、ホーム画面に追加するとアプリのように開けます。',

  'wd.0': '日',
  'wd.1': '月',
  'wd.2': '火',
  'wd.3': '水',
  'wd.4': '木',
  'wd.5': '金',
  'wd.6': '土',
}

const DICTS: Record<Lang, Dict> = { vi, en, ja }

const STORAGE_KEY = 'thosach:lang'
const listeners = new Set<() => void>()
let current: Lang = 'vi'
let initialised = false

function detect(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'vi' || saved === 'en' || saved === 'ja') return saved
  } catch {
    // Storage blocked: fall through to the browser language.
  }
  const nav = (navigator.language || 'vi').toLowerCase()
  if (nav.startsWith('ja')) return 'ja'
  if (nav.startsWith('en')) return 'en'
  return 'vi'
}

function read(): Lang {
  if (!initialised) {
    initialised = true
    current = detect()
    document.documentElement.lang = current
  }
  return current
}

export function setLang(lang: Lang) {
  current = lang
  initialised = true
  try {
    window.localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Keep working in memory.
  }
  document.documentElement.lang = lang
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Current language for non-React code (formatters). Defaults to Vietnamese on the server. */
export function getLang(): Lang {
  return typeof window === 'undefined' ? 'vi' : read()
}

export function localeOf(lang: Lang = getLang()): string {
  return LANGS.find((l) => l.id === lang)?.locale ?? 'vi-VN'
}

export function translate(lang: Lang, key: TKey, params?: Record<string, string | number>): string {
  let text: string = DICTS[lang][key]
  if (params) {
    for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}

export type Translator = (key: TKey, params?: Record<string, string | number>) => string

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => 'vi')
}

export function useT(): { t: Translator; lang: Lang } {
  const lang = useLang()
  const t = useCallback<Translator>((key, params) => translate(lang, key, params), [lang])
  return { t, lang }
}
