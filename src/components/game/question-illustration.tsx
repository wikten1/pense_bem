import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Illustration, IllustrationId } from '@/content/aladdin-visuals';
import { SoundPressable } from '@/components/sound-pressable';
import { colors, space } from '@/theme/tokens';

const images: Record<IllustrationId, number> = {
  'money-bank': require('../../../assets/images/questions/aladdin/money-bank.lossless.webp'),
  'time-objects': require('../../../assets/images/questions/aladdin/time-objects.lossless.webp'),
  'money-wallet': require('../../../assets/images/questions/aladdin/money-wallet.lossless.webp'),
  'wood-cutting': require('../../../assets/images/questions/aladdin/wood-cutting.lossless.webp'),
  'temperature-tools': require('../../../assets/images/questions/aladdin/temperature-tools.lossless.webp'),
  'liquid-measure': require('../../../assets/images/questions/aladdin/liquid-measure.lossless.webp'),
  'length-tools': require('../../../assets/images/questions/aladdin/length-tools.lossless.webp'),
  'person-scale': require('../../../assets/images/questions/aladdin/person-scale.lossless.webp'),
  'food-scale': require('../../../assets/images/questions/aladdin/food-scale.lossless.webp'),
  'mysterious-cave': require('../../../assets/images/questions/aladdin/mysterious-cave.lossless.webp'),
  grande: require('../../../assets/images/questions/aladdin/grande.lossless.webp'),
  alegre: require('../../../assets/images/questions/aladdin/alegre.lossless.webp'),
  sujo: require('../../../assets/images/questions/aladdin/sujo.lossless.webp'),
  doce: require('../../../assets/images/questions/aladdin/doce.lossless.webp'),
  curva: require('../../../assets/images/questions/aladdin/curva.lossless.webp'),
  noite: require('../../../assets/images/questions/aladdin/noite.lossless.webp'),
  fechado: require('../../../assets/images/questions/aladdin/fechado.lossless.webp'),
  gordo: require('../../../assets/images/questions/aladdin/gordo.lossless.webp'),
  palace: require('../../../assets/images/questions/aladdin/palace.webp'),
  'tiger-lunch': require('../../../assets/images/questions/aladdin/tiger-lunch.lossless.webp'),
  'tiger-cubs': require('../../../assets/images/questions/aladdin/tiger-cubs.webp'),
  'tiger-calm': require('../../../assets/images/questions/aladdin/tiger-calm.webp'),
  'tiger-attack': require('../../../assets/images/questions/aladdin/tiger-attack.webp'),
  characters: require('../../../assets/images/questions/aladdin/characters.webp'),
  instruments: require('../../../assets/images/questions/aladdin/instruments.webp'),
  desert: require('../../../assets/images/questions/aladdin/desert.webp'),
  'al-vegetables': require('../../../assets/images/questions/aladdin/al-vegetables.lossless.webp'),
  'al-safety-pin': require('../../../assets/images/questions/aladdin/al-safety-pin.lossless.webp'),
  'al-cushion': require('../../../assets/images/questions/aladdin/al-cushion.lossless.webp'),
  'al-pliers': require('../../../assets/images/questions/aladdin/al-pliers.lossless.webp'),
  'al-artichoke': require('../../../assets/images/questions/aladdin/al-artichoke.lossless.webp'),
  'al-cotton': require('../../../assets/images/questions/aladdin/al-cotton.lossless.webp'),
  'al-alcohol': require('../../../assets/images/questions/aladdin/al-alcohol.lossless.webp'),
  'sinbad-boats': require('../../../assets/images/questions/aladdin/sinbad-boats.lossless.webp'),
  'arabian-headwear': require('../../../assets/images/questions/aladdin/arabian-headwear.lossless.webp'),
  'arabian-footwear': require('../../../assets/images/questions/aladdin/arabian-footwear.lossless.webp'),
  'arabian-vest': require('../../../assets/images/questions/aladdin/arabian-vest.lossless.webp'),
  'arabian-trousers': require('../../../assets/images/questions/aladdin/arabian-trousers.lossless.webp'),
  'aladdin-lamp': require('../../../assets/images/questions/aladdin/aladdin-lamp.lossless.webp'),
  'ancient-objects': require('../../../assets/images/questions/aladdin/ancient-objects.lossless.webp'),
  crossword: require('../../../assets/images/questions/aladdin/crossword.lossless.webp'),
  bay: require('../../../assets/images/questions/aladdin/bay.webp'),
  island: require('../../../assets/images/questions/aladdin/island.webp'),
  reef: require('../../../assets/images/questions/aladdin/reef.webp'),
  cape: require('../../../assets/images/questions/aladdin/cape.webp'),
  mermaid: require('../../../assets/images/questions/aladdin/mermaid.webp'),
  centaur: require('../../../assets/images/questions/aladdin/centaur.webp'),
  curupira: require('../../../assets/images/questions/aladdin/curupira.webp'),
  dragon: require('../../../assets/images/questions/aladdin/dragon.webp'),
  unicorn: require('../../../assets/images/questions/aladdin/unicorn.webp'),
  werewolf: require('../../../assets/images/questions/aladdin/werewolf.webp'),
  puzzle: require('../../../assets/images/questions/aladdin/puzzle.webp'),
  sherazade: require('../../../assets/images/questions/aladdin/sherazade-options.lossless.webp'),
  'ali-baba-sequence': require('../../../assets/images/questions/aladdin/ali-baba-sequence.webp'),
  cinema: require('../../../assets/images/questions/aladdin/cinema.lossless.webp'),
  filmmaking: require('../../../assets/images/questions/aladdin/filmmaking.lossless.webp'),
  'genie-sequence': require('../../../assets/images/questions/aladdin/genie-sequence.lossless.webp'),
  orchestra: require('../../../assets/images/questions/aladdin/orchestra.webp'),
  'home-video': require('../../../assets/images/questions/aladdin/home-video.png'),
};

export function QuestionIllustration({ illustration }: { illustration: Illustration }) {
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const aspectRatio = illustration.width / illustration.height;
  const expandedWidth = Math.max(width, illustration.width);
  const source = images[illustration.id];

  return (
    <View style={styles.container}>
      <SoundPressable
        accessibilityRole="button"
        accessibilityLabel={`Ampliar ilustração. ${illustration.description}`}
        accessibilityHint="Abre a imagem maior para examinar os detalhes."
        onPress={() => setExpanded(true)}>
        <Image source={source} style={[styles.image, { aspectRatio }]} contentFit="contain" />
        <Text style={styles.caption}>Toque para ampliar a ilustração</Text>
      </SoundPressable>
      {expanded ? <Modal visible animationType="fade" onRequestClose={() => setExpanded(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.md }]} accessibilityViewIsModal>
          <SoundPressable sound="back" accessibilityRole="button" onPress={() => setExpanded(false)} style={styles.close}>
            <Text style={styles.closeText}>Fechar ilustração</Text>
          </SoundPressable>
          <Text style={styles.instructions}>Arraste para ver os detalhes da imagem.</Text>
          <ScrollView style={styles.viewer}>
            <ScrollView horizontal>
              <Image
                source={source}
                accessibilityLabel={illustration.description}
                style={{ width: expandedWidth, height: expandedWidth / aspectRatio }}
                contentFit="contain"
              />
            </ScrollView>
          </ScrollView>
        </View>
      </Modal> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.sm },
  image: { width: '100%', borderRadius: 12, backgroundColor: '#fff' },
  caption: { color: colors.goldLight, fontSize: 13, paddingVertical: space.sm, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: colors.background },
  close: { padding: space.md, minHeight: 48, alignSelf: 'flex-end' },
  closeText: { color: colors.goldLight, fontSize: 16 },
  instructions: { color: colors.text, fontSize: 14, padding: space.md },
  viewer: { flex: 1 },
});
