import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

interface ForestArtworkProps {
  variant?: 'hero' | 'activity';
}

export function ForestArtwork({ variant = 'hero' }: ForestArtworkProps) {
  const compact = variant === 'activity';

  return (
    <View style={styles.scene} accessibilityElementsHidden>
      <LinearGradient
        colors={compact ? ['#82a99b', '#dae3be'] : ['#315e68', '#a5c5b8', '#d9dfc7']}
        locations={compact ? [0, 1] : [0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.mountain, styles.mountainBack]} />
      <View style={[styles.mountain, styles.mountainFront]} />
      <View style={styles.hillBack} />
      <View style={styles.hillFront} />
      <View style={styles.treeLine}>
        {[0, 1, 2, 3, 4, 5, 6].map((tree, index) => (
          <View
            key={tree}
            style={[
              styles.tree,
              {
                height: `${compact ? 31 + ((index * 13) % 26) : 34 + ((index * 17) % 38)}%`,
                opacity: 0.58 + ((index % 3) * 0.12),
                transform: [{ scaleX: index % 2 === 0 ? 0.78 : 1.04 }],
              },
            ]}>
            <View style={styles.treeTop} />
            <View style={styles.treeTrunk} />
          </View>
        ))}
      </View>
      {!compact && (
        <View style={styles.fogLine}>
          <View style={styles.fogPatch} />
          <View style={[styles.fogPatch, styles.fogPatchSecond]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { ...StyleSheet.absoluteFill, overflow: 'hidden', backgroundColor: '#9dbbac' },
  mountain: {
    position: 'absolute',
    width: '80%',
    height: '55%',
    bottom: '29%',
    backgroundColor: '#7b9e94',
    borderRadius: 100,
  },
  mountainBack: { left: '-21%', transform: [{ rotate: '-15deg' }] },
  mountainFront: {
    right: '-26%',
    bottom: '34%',
    backgroundColor: '#97b3a5',
    transform: [{ rotate: '14deg' }],
  },
  hillBack: {
    position: 'absolute',
    width: '130%',
    height: '39%',
    left: '-15%',
    bottom: '-8%',
    backgroundColor: '#668d76',
    borderRadius: 180,
  },
  hillFront: {
    position: 'absolute',
    width: '132%',
    height: '31%',
    left: '-20%',
    bottom: '-16%',
    backgroundColor: '#315f52',
    borderRadius: 160,
  },
  treeLine: {
    position: 'absolute',
    left: '-3%',
    right: '-3%',
    bottom: '14%',
    height: '72%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tree: { width: '17%', alignItems: 'center', justifyContent: 'flex-end' },
  treeTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 34,
    borderRightWidth: 34,
    borderBottomWidth: 98,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#204b45',
  },
  treeTrunk: { width: 7, height: 24, marginTop: -2, backgroundColor: '#453d32' },
  fogLine: {
    position: 'absolute',
    left: '-10%',
    right: '-10%',
    top: '51%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fogPatch: {
    width: '56%',
    height: 22,
    borderRadius: 30,
    backgroundColor: 'rgba(241, 247, 233, 0.38)',
  },
  fogPatchSecond: { width: '37%', marginTop: 27, marginLeft: -55, opacity: 0.8 },
});
