import WidgetKit
import SwiftUI

struct QalbyMuslimWidget: Widget {
    let kind: String = "QalbyMuslimWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QalbyMuslimWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Qalby Muslim")
        .description("Islamic prayer times and daily verses")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            ayah: AyahData(
                arabic: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
                translation: "O my Lord, surely I have need of whatever good You send me.",
                surah: "Al-Qasas",
                ayahNumber: "24"
            ),
            prayerTimes: PrayerTimesData(
                fajr: "5:30 AM",
                sunrise: "6:45 AM",
                dhuhr: "12:15 PM",
                asr: "3:30 PM",
                maghrib: "6:00 PM",
                isha: "7:30 PM",
                currentPrayer: "Dhuhr",
                nextPrayer: "Asr",
                timeToNext: "2h 15m"
            ),
            location: "Your Location"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = placeholder(in: context)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []
        
        // Load data from shared UserDefaults
        let sharedDefaults = UserDefaults(suiteName: "group.com.qalbymuslim.app")
        
        let ayahData = loadAyahData(from: sharedDefaults)
        let prayerData = loadPrayerData(from: sharedDefaults)
        let location = sharedDefaults?.string(forKey: "location") ?? "Your Location"
        
        let currentDate = Date()
        let entry = SimpleEntry(
            date: currentDate,
            ayah: ayahData,
            prayerTimes: prayerData,
            location: location
        )
        entries.append(entry)

        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadAyahData(from defaults: UserDefaults?) -> AyahData {
        guard let defaults = defaults,
              let arabic = defaults.string(forKey: "currentAyah_arabic"),
              let translation = defaults.string(forKey: "currentAyah_translation"),
              let surah = defaults.string(forKey: "currentAyah_surah"),
              let ayahNumber = defaults.string(forKey: "currentAyah_number") else {
            return AyahData(
                arabic: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
                translation: "O my Lord, surely I have need of whatever good You send me.",
                surah: "Al-Qasas",
                ayahNumber: "24"
            )
        }
        return AyahData(arabic: arabic, translation: translation, surah: surah, ayahNumber: ayahNumber)
    }
    
    private func loadPrayerData(from defaults: UserDefaults?) -> PrayerTimesData {
        guard let defaults = defaults else {
            return PrayerTimesData(
                fajr: "--:--", sunrise: "--:--", dhuhr: "--:--",
                asr: "--:--", maghrib: "--:--", isha: "--:--",
                currentPrayer: "", nextPrayer: "", timeToNext: ""
            )
        }
        
        return PrayerTimesData(
            fajr: defaults.string(forKey: "prayer_fajr") ?? "--:--",
            sunrise: defaults.string(forKey: "prayer_sunrise") ?? "--:--",
            dhuhr: defaults.string(forKey: "prayer_dhuhr") ?? "--:--",
            asr: defaults.string(forKey: "prayer_asr") ?? "--:--",
            maghrib: defaults.string(forKey: "prayer_maghrib") ?? "--:--",
            isha: defaults.string(forKey: "prayer_isha") ?? "--:--",
            currentPrayer: defaults.string(forKey: "currentPrayer") ?? "",
            nextPrayer: defaults.string(forKey: "nextPrayer") ?? "",
            timeToNext: defaults.string(forKey: "timeToNext") ?? ""
        )
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let ayah: AyahData
    let prayerTimes: PrayerTimesData
    let location: String
}

struct AyahData {
    let arabic: String
    let translation: String
    let surah: String
    let ayahNumber: String
}

struct PrayerTimesData {
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let currentPrayer: String
    let nextPrayer: String
    let timeToNext: String
}

struct QalbyMuslimWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            MediumWidgetView(entry: entry)
        }
    }
}

struct MediumWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: [
                    Color(red: 15/255, green: 32/255, blue: 39/255),
                    Color(red: 0/255, green: 81/255, blue: 95/255),
                    Color(red: 54/255, green: 138/255, blue: 149/255)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack {
                    Text("السلام عليكم")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(Color(red: 247/255, green: 232/255, blue: 164/255))
                    
                    Spacer()
                    
                    if !entry.prayerTimes.timeToNext.isEmpty {
                        Text(entry.prayerTimes.timeToNext)
                            .font(.caption)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.white.opacity(0.2))
                            .cornerRadius(8)
                    }
                }
                
                // Arabic text
                Text(entry.ayah.arabic)
                    .font(.system(size: 16))
                    .fontWeight(.semibold)
                    .foregroundColor(Color(red: 247/255, green: 232/255, blue: 164/255))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                
                Spacer()
                
                // Translation
                Text(entry.ayah.translation)
                    .font(.caption)
                    .foregroundColor(.white)
                    .lineLimit(2)
                
                // Surah info
                Text("\(entry.ayah.surah) • Ayah \(entry.ayah.ayahNumber)")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
            .padding()
        }
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color(red: 247/255, green: 232/255, blue: 164/255), lineWidth: 2)
        )
    }
}

struct LargeWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: [
                    Color(red: 15/255, green: 32/255, blue: 39/255),
                    Color(red: 0/255, green: 81/255, blue: 95/255),
                    Color(red: 54/255, green: 138/255, blue: 149/255)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 12) {
                // Header
                HStack {
                    VStack(alignment: .leading) {
                        Text("السلام عليكم")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 247/255, green: 232/255, blue: 164/255))
                        
                        Text(entry.location)
                            .font(.caption)
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    if !entry.prayerTimes.timeToNext.isEmpty {
                        VStack {
                            Text("Next Prayer")
                                .font(.caption2)
                                .foregroundColor(.gray)
                            Text(entry.prayerTimes.timeToNext)
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 255/255, green: 215/255, blue: 0/255))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.white.opacity(0.15))
                        .cornerRadius(12)
                    }
                }
                
                // Arabic verse
                Text(entry.ayah.arabic)
                    .font(.system(size: 20))
                    .fontWeight(.semibold)
                    .foregroundColor(Color(red: 247/255, green: 232/255, blue: 164/255))
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                
                // Translation
                Text(entry.ayah.translation)
                    .font(.body)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                
                // Surah info
                Text("\(entry.ayah.surah) • Ayah \(entry.ayah.ayahNumber)")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Spacer()
                
                // Prayer times grid
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                    PrayerTimeCard(name: "Fajr", time: entry.prayerTimes.fajr, isCurrent: entry.prayerTimes.currentPrayer == "Fajr")
                    PrayerTimeCard(name: "Dhuhr", time: entry.prayerTimes.dhuhr, isCurrent: entry.prayerTimes.currentPrayer == "Dhuhr")
                    PrayerTimeCard(name: "Asr", time: entry.prayerTimes.asr, isCurrent: entry.prayerTimes.currentPrayer == "Asr")
                    PrayerTimeCard(name: "Maghrib", time: entry.prayerTimes.maghrib, isCurrent: entry.prayerTimes.currentPrayer == "Maghrib")
                    PrayerTimeCard(name: "Isha", time: entry.prayerTimes.isha, isCurrent: entry.prayerTimes.currentPrayer == "Isha")
                }
            }
            .padding()
        }
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color(red: 247/255, green: 232/255, blue: 164/255), lineWidth: 2)
        )
    }
}

struct PrayerTimeCard: View {
    let name: String
    let time: String
    let isCurrent: Bool
    
    var body: some View {
        VStack(spacing: 2) {
            Text(name)
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundColor(isCurrent ? Color(red: 255/255, green: 215/255, blue: 0/255) : Color(red: 247/255, green: 232/255, blue: 164/255))
            
            Text(time)
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(isCurrent ? Color(red: 255/255, green: 215/255, blue: 0/255) : .white)
        }
        .padding(.vertical, 6)
        .padding(.horizontal, 4)
        .background(
            Color.white.opacity(isCurrent ? 0.25 : 0.15)
        )
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(
                    isCurrent ? Color(red: 255/255, green: 215/255, blue: 0/255) : Color(red: 247/255, green: 232/255, blue: 164/255),
                    lineWidth: isCurrent ? 1.5 : 1
                )
        )
    }
}

@main
struct QalbyMuslimWidgetBundle: WidgetBundle {
    var body: some Widget {
        QalbyMuslimWidget()
    }
}